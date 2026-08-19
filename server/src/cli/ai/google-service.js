import { google } from "@ai-sdk/google";
import { streamText, generateObject } from "ai";
import { config } from "../../config/google.config.js";
import chalk from "chalk";

export class AIService {
  constructor() {
    if (!config.googleApiKey) {
      throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables");
    }
    
    this.modelName = config.model;
    this.model = google(this.modelName, {
      apiKey: config.googleApiKey,
    });

    this.fallbackModel = config.fallbackModel && config.fallbackModel !== this.modelName
      ? google(config.fallbackModel, { apiKey: config.googleApiKey })
      : null;
  }

  /**
   * Send a message and get streaming response
   * @param {Array} messages - Array of message objects {role, content}
   * @param {Function} onChunk - Callback for each text chunk
   * @param {Object} tools - Optional tools object
   * @param {Function} onToolCall - Callback for tool calls
   * @returns {Promise<Object>} Full response with content, tool calls, and usage
   */
  async sendMessage(messages, onChunk, tools = undefined, onToolCall = null) {
    try {
      return await this.streamWithModel(this.model, messages, onChunk, tools, onToolCall);
    } catch (error) {
      if (!this.fallbackModel || !this.isQuotaError(error)) {
        throw this.toServiceError(error);
      }

      console.warn(chalk.yellow(`Primary model quota reached; retrying with ${config.fallbackModel}.`));
      try {
        return await this.streamWithModel(this.fallbackModel, messages, onChunk, tools, onToolCall);
      } catch (fallbackError) {
        throw this.toServiceError(fallbackError);
      }
    }
  }

  async streamWithModel(model, messages, onChunk, tools, onToolCall) {
    const streamConfig = {
      model,
      messages,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      maxRetries: config.maxRetries,
      onError: () => {},
    };

    if (tools && Object.keys(tools).length > 0) {
      streamConfig.tools = tools;
      streamConfig.maxSteps = 5;
      console.log(chalk.gray(`[DEBUG] Tools enabled: ${Object.keys(tools).join(', ')}`));
    }

    const result = streamText(streamConfig);
    let fullResponse = "";
      
    // Consume the full stream so provider errors are handled by this service.
    for await (const chunk of result.fullStream) {
      if (chunk.type === "error") {
        throw chunk.error;
      }

      if (chunk.type === "text-delta") {
        fullResponse += chunk.text;
        if (onChunk) {
          onChunk(chunk.text);
        }
      }
    }

    // IMPORTANT: Await the result to get access to steps, toolCalls, etc.
    const fullResult = await result;
      
    const toolCalls = [];
    const toolResults = [];
      
    // Collect tool calls from all steps (if they exist)
    if (fullResult.steps && Array.isArray(fullResult.steps)) {
      for (const step of fullResult.steps) {
        if (step.toolCalls && step.toolCalls.length > 0) {
          for (const toolCall of step.toolCalls) {
            toolCalls.push(toolCall);
            if (onToolCall) {
              onToolCall(toolCall);
            }
          }
        }

        // Collect tool results
        if (step.toolResults && step.toolResults.length > 0) {
          toolResults.push(...step.toolResults);
        }
      }
    }

    return {
      content: fullResponse,
      finishReason: fullResult.finishReason,
      usage: fullResult.usage,
      toolCalls,
      toolResults,
      steps: fullResult.steps,
    };
  }

  isQuotaError(error) {
    const nestedErrors = [error, error?.lastError, ...(Array.isArray(error?.errors) ? error.errors : [])];
    return nestedErrors.some((candidate) => candidate?.statusCode === 429 || /quota|rate limit|resource exhausted/i.test(candidate?.message || ""));
  }

  toServiceError(error) {
    const nestedErrors = [error, error?.lastError, ...(Array.isArray(error?.errors) ? error.errors : [])];
    const providerError = nestedErrors.find((candidate) => candidate?.statusCode);
    const message = providerError?.message || error?.message || "The AI provider returned an unknown error.";
    const serviceError = new Error(message);
    serviceError.statusCode = providerError?.statusCode || error?.statusCode;
    console.error(chalk.red("AI Service Error:"), message);
    return serviceError;
  }

  /**
   * Get a non-streaming response
   * @param {Array} messages - Array of message objects
   * @param {Object} tools - Optional tools
   * @returns {Promise<string>} Response text
   */
  async getMessage(messages, tools = undefined) {
    let fullResponse = "";
    const result = await this.sendMessage(messages, (chunk) => {
      fullResponse += chunk;
    }, tools);
    return result.content;
  }

  /**
   * Generate structured output using a Zod schema
   * @param {Object} schema - Zod schema
   * @param {string} prompt - Prompt for generation
   * @returns {Promise<Object>} Parsed object matching the schema
   */
  async generateStructured(schema, prompt) {
    try {
      const result = await generateObject({
        model: this.model,
        schema: schema,
        prompt: prompt,
      });
      
      return result.object;
    } catch (error) {
      console.error(chalk.red("AI Structured Generation Error:"), error.message);
      throw error;
    }
  }
}
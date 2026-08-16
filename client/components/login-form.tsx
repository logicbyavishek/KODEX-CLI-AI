"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { DiGithubBadge } from "react-icons/di";
import { useState } from "react";





export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);


const onLogin = async()=>{
  setIsLoading(true);
  await authClient.signIn.social({
    provider: "github",
    callbackURL: process.env.NEXT_PUBLIC_CLIENT_ORIGIN || "http://localhost:3000",
    errorCallbackURL: `${process.env.NEXT_PUBLIC_CLIENT_ORIGIN || "http://localhost:3000"}/sign-in`
  })
  setIsLoading(false);
}


  return (
    <div className="flex flex-col gap-6 justify-center items-center ">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Image src={"/login.svg"} alt="Login" height={500} width={500}/>
        <h1 className="text-6xl font-extrabold text-indigo-400">Welcome Back! to KODEX Cli</h1>
        <p className="text-base font-medium text-zinc-400">Login to your account for allowing device flow</p>
      </div>
      <Card className="border-dashed border-2">
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              <Button
                variant={"outline"}
                className="w-full h-full"
                type="button"
                onClick={onLogin}
                disabled={isLoading}
              >
                <DiGithubBadge className="size-4" />
                Continue With GitHub
              </Button>

            </div>

          </div>

        </CardContent>
      </Card>
    </div>
  )
} 
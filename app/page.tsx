"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, BookOpen, CheckCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-[#1a1d2e]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/2 -left-1/2 h-[800px] w-[800px] rounded-full bg-[#4E5173] blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-1/2 -right-1/2 h-[800px] w-[800px] rounded-full bg-[#4E5173] blur-3xl"
        />
      </div>

      <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl text-center">
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/80 px-6 py-3 shadow-lg backdrop-blur-sm dark:bg-[#4E5173]/40"
          >
            <BookOpen className="h-6 w-6 text-[#4E5173] dark:text-white" />
            <span className="text-xl font-bold text-[#4E5173] dark:text-white">DHFAI Journal</span>
          </motion.div>

          {/* Hero heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-5xl font-bold tracking-tight text-[#2a2d3e] dark:text-white sm:text-6xl lg:text-7xl"
          >
            Your Digital Journal,{" "}
            <span className="text-[#4E5173] dark:text-[#7a7ea8]">
              Reimagined
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mb-12 max-w-2xl text-lg text-gray-600 dark:text-gray-300 sm:text-xl"
          >
            Organize your thoughts, track your tasks, and capture your ideas in a beautiful,
            intuitive journaling experience designed for the modern age.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16 flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <Button
              asChild
              size="lg"
              className="group bg-[#4E5173] text-white hover:bg-[#3d4160] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Link href="/get-started">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-[#4E5173] text-[#4E5173] hover:bg-[#4E5173] hover:text-white dark:border-[#7a7ea8] dark:text-[#7a7ea8] dark:hover:bg-[#4E5173] shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Link href="/dashboard">
                View Dashboard
              </Link>
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid gap-6 sm:grid-cols-3"
          >
            {[
              { icon: BookOpen, title: "Rich Notes", desc: "Write with powerful editor" },
              { icon: CheckCircle, title: "Task Management", desc: "Stay organized effortlessly" },
              { icon: Sparkles, title: "Beautiful UI", desc: "Elegant and intuitive design" },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="group rounded-2xl bg-white/80 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl dark:bg-[#4E5173]/20 dark:hover:bg-[#4E5173]/30"
              >
                <feature.icon className="mx-auto mb-4 h-12 w-12 text-[#4E5173] dark:text-white transition-transform duration-300 group-hover:scale-110" />
                <h3 className="mb-2 text-xl font-semibold text-[#2a2d3e] dark:text-white">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

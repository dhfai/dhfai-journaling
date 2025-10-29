"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, BookOpen, CheckCircle, Sparkles, PenLine, Calendar, Target, Zap, Shield, Cloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-white via-gray-50 to-blue-50 dark:from-[#0f1218] dark:via-[#1a1d2e] dark:to-[#1e2133]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.08, 0.03],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/2 -left-1/2 h-[1000px] w-[1000px] rounded-full bg-linear-to-br from-blue-500 to-purple-500 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.03, 0.08, 0.03],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-1/2 -right-1/2 h-[1000px] w-[1000px] rounded-full bg-linear-to-br from-purple-500 to-pink-500 blur-3xl"
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.sin(i) * 20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
            className="absolute h-2 w-2 rounded-full bg-blue-400 dark:bg-blue-300"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
            }}
          />
        ))}
      </div>

      <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl w-full">
          {/* Logo/Brand with badge */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-12 flex flex-col items-center gap-4"
          >
            <div className="inline-flex items-center gap-3 rounded-full bg-white/90 px-8 py-4 shadow-2xl backdrop-blur-md dark:bg-[#4E5173]/60 ring-1 ring-gray-200/50 dark:ring-white/10">
              <div className="relative">
                <BookOpen className="h-8 w-8 text-[#4E5173] dark:text-white" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-1 rounded-full bg-blue-400/20 blur-sm"
                />
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-[#4E5173] to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-300">
                DHFAI Journal
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-lg"
            >
              <Sparkles className="h-4 w-4" />
              <span>Free Forever • No Credit Card Required</span>
            </motion.div>
          </motion.div>

          {/* Hero heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-center mb-8"
          >
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
              Your Digital Journal,{" "}
              <br className="hidden sm:block" />
              <span className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
                Beautifully Reimagined
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mb-12 max-w-3xl text-lg leading-relaxed text-gray-600 dark:text-gray-300 sm:text-xl">
              Transform the way you organize your thoughts, track tasks, and capture ideas.
              <br className="hidden sm:block" />
              Experience journaling with a <strong className="text-gray-900 dark:text-white">modern, intuitive interface</strong> designed for productivity.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mb-20 flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <Button
              asChild
              size="lg"
              className="group relative overflow-hidden bg-linear-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-base px-8 py-6 h-auto"
            >
              <Link href="/get-started">
                <motion.div
                  animate={{ x: [-100, 100] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-1/2 bg-linear-to-r from-transparent via-white/20 to-transparent"
                />
                <Zap className="mr-2 h-5 w-5" />
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-[#4E5173]/30 shadow-lg hover:shadow-xl transition-all duration-300 text-base px-8 py-6 h-auto backdrop-blur-sm bg-white/50 dark:bg-white/5"
            >
              <Link href="/dashboard">
                View Dashboard
              </Link>
            </Button>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-12">
              Everything You Need to Stay Organized
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: PenLine,
                  title: "Rich Text Editor",
                  desc: "Write with powerful formatting tools, markdown support, and beautiful typography",
                  gradient: "from-blue-500 to-cyan-500"
                },
                {
                  icon: CheckCircle,
                  title: "Task Management",
                  desc: "Track todos, set deadlines, and organize tasks with drag-and-drop simplicity",
                  gradient: "from-purple-500 to-pink-500"
                },
                {
                  icon: Calendar,
                  title: "Daily Planning",
                  desc: "Plan your day, week, and month with intuitive calendar integration",
                  gradient: "from-orange-500 to-red-500"
                },
                {
                  icon: Target,
                  title: "Goal Tracking",
                  desc: "Set and achieve your goals with progress tracking and reminders",
                  gradient: "from-green-500 to-emerald-500"
                },
                {
                  icon: Cloud,
                  title: "Cloud Sync",
                  desc: "Access your notes anywhere, anytime with automatic cloud synchronization",
                  gradient: "from-cyan-500 to-blue-500"
                },
                {
                  icon: Shield,
                  title: "Private & Secure",
                  desc: "Your data is encrypted and secure. Only you have access to your journals",
                  gradient: "from-indigo-500 to-purple-500"
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <Card className="group relative overflow-hidden h-full bg-white/80 backdrop-blur-sm border-gray-200/50 dark:bg-[#1e2133]/80 dark:border-gray-700/50 p-8 transition-all duration-300 hover:shadow-2xl hover:border-transparent">
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br ${feature.gradient} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>

                    <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {feature.desc}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 p-12 text-center shadow-2xl"
          >
            <div className="absolute inset-0">
              <motion.div
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"
                style={{ backgroundSize: '100% 100%' }}
              />
            </div>

            <div className="relative z-10">
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                Ready to Transform Your Journaling?
              </h2>
              <p className="mb-8 text-lg text-white/90 max-w-2xl mx-auto">
                Join thousands of users who have already discovered a better way to organize their life
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-base px-10 py-6 h-auto font-semibold"
              >
                <Link href="/get-started">
                  Start Your Journey Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-gray-200/50 dark:border-gray-700/50 py-8 px-6 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 DHFAI Journal. Made with ❤️ for productivity enthusiasts.
          </p>
        </div>
      </footer>
    </div>
  );
}

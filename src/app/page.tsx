
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MapPin, Users, Activity } from "lucide-react";
import Image from "next/image";


export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-[#f8fafc]">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#primary-red]/5 blur-3xl opacity-30" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-[#primary-blue]/5 blur-3xl opacity-30" />
      </div>

      <Card className="max-w-md w-full text-center p-10 backdrop-blur-3xl border-white/40">
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl transform rotate-3 overflow-hidden border-4 border-white/50 relative">
            <Image
              src="/logo.png"
              alt="HUJI Run Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-gray-900">
          HUJI <span className="text-[#e63946]">Run</span>
        </h1>

        <p className="text-gray-500 mb-8 text-lg leading-relaxed">
          Track your runs, join team's trainings, stay connected with the squad and let the coach track your progress.
        </p>

        {user ? (
          <div className="space-y-4">
            <Link href="/feed" className="w-full block">
              <Button className="w-full text-lg py-4 shadow-xl shadow-red-500/20">
                Go to Feed
              </Button>
            </Link>
            <p className="text-sm text-gray-400">Welcome back, Runner!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Link href="/login" className="w-full block">
              <Button className="w-full text-lg py-4 shadow-xl shadow-red-500/20">
                Log In
              </Button>
            </Link>
            <Link href="/signup" className="w-full block">
              <Button variant="ghost" className="w-full">
                New here? Join the team
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <div className="bg-red-50 p-2 rounded-lg text-[#e63946]">
              <Activity size={18} />
            </div>
            <span className="text-xs font-medium text-gray-500">Track</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="bg-blue-50 p-2 rounded-lg text-[#1d3557]">
              <Users size={18} />
            </div>
            <span className="text-xs font-medium text-gray-500">Connect</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="bg-teal-50 p-2 rounded-lg text-teal-600">
              <MapPin size={18} />
            </div>
            <span className="text-xs font-medium text-gray-500">Meet</span>
          </div>
        </div>
      </Card>

      <p className="fixed bottom-6 text-xs text-gray-400">
        © 2026 HUJI Run Team
      </p>
    </main>
  );
}

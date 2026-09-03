import React from 'react';
import { Hammer, ShieldAlert, Github, Swords } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 text-center bg-slate-950 font-sans">
      <div className="max-w-3xl w-full space-y-8 animate-in fade-in zoom-in duration-700">
        
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Hammer className="w-24 h-24 text-blue-500 animate-bounce" />
            <ShieldAlert className="w-10 h-10 text-red-500 absolute -bottom-2 -right-2" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          UNDER MAINTENANCE
        </h1>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
          <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
            This project is currently down for maintenance. 
            <span className="block mt-2 font-semibold text-blue-400 italic">
              "This project was originally made by another person."
            </span>
          </p>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-4"></div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-red-500 font-bold text-lg">
              <Swords className="w-6 h-6" />
              <span>THE CHALLENGE</span>
            </div>
            <p className="text-slate-400 text-lg">
              If you have the courage to code, then go ahead and push unlimited files and folders to this GitHub. 
              Let's see what stays and what goes.
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center py-8">
          <a 
            href="https://github.com/MayankGitHub86/solvehub" 
            className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-slate-200 transition-all transform hover:scale-105"
          >
            <Github className="w-5 h-5" />
            Github Repo
          </a>
        </div>

        <p className="text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} SolveHub System. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default App;

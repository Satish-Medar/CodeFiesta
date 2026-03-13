import { Instagram, Mail, Twitter, Youtube } from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-zinc-800 py-8 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-zinc-400">
        Made with ❤️ by Sparks Minds
      </div>

      <div className="flex gap-4 items-center">
        <a href="#" className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300">
          <Youtube />
        </a>
        <a href="#" className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300">
          <Instagram className="w-5 h-5" />
        </a>
        <a href="#" className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300">
          <Twitter className="w-5 h-5" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;

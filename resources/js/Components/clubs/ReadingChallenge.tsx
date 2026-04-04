import React from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface BookChallenge {
  id: number;
  title: string;
  progress: number;
}

interface ReadingChallengeProps {
  challenge: {
    title: string;
    books: BookChallenge[];
  };
}

export const ReadingChallenge: React.FC<ReadingChallengeProps> = ({ challenge }) => (
  <div className="bg-white/5 rounded-[24px] p-5 border border-white/5">
    {/* contenu … */}
  </div>
);

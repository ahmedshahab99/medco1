import React from "react";
import { Star, Clock } from "lucide-react";

interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  text: string;
}

interface ReviewSectionProps {
  reviews: Review[];
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ reviews }) => {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-4 dark:text-white px-2">Patient Reviews</h2>
      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white dark:bg-zinc-900/70 p-5 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-zinc-800 dark:text-zinc-100">{review.author}</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < review.rating ? "fill-zinc-900 text-zinc-900 dark:fill-zinc-100 dark:text-zinc-100" : "fill-zinc-200 text-zinc-200 dark:fill-zinc-800 dark:text-zinc-800"} />
                ))}
              </div>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-3">
              "{review.text}"
            </p>
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 w-fit px-2 py-1 rounded-md">
               <Clock size={12} /> {review.date}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReviewSection;

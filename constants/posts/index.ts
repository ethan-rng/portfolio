import type { Post, Category } from "../types";
import { mlgkAutopilot } from "./mlgk-autopilot";
import { cityflow } from "./cityflow";
import { interviewRooms } from "./interview-rooms";
import { hackerPass } from "./hacker-pass";
import { deepseekCase } from "./deepseek-case";
import { goodMeals } from "./good-meals";
import { outOfOffice } from "./out-of-office";
import { westernFounders } from "./western-founders";

/**
 * Every post, newest first. To add one: create a file next to these,
 * export a Post from it, and add it to this list.
 */
export const posts: Post[] = [mlgkAutopilot, cityflow, interviewRooms, hackerPass, deepseekCase, goodMeals, outOfOffice, westernFounders].sort((a, b) => b.date.localeCompare(a.date));

export const postsIn = (category: Category) => posts.filter((p) => p.category === category);
export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

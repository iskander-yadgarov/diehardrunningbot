import { Context } from "telegraf";

/**
 * Wrapper to catch async errors within a stage. Helps to avoid try catch blocks in there
 * @param fn - function to enter a stage
 */
const asyncWrapper = (fn: Function) => {
  return async function(ctx: Context, next: Function) {
    try {
      return await fn(ctx);
    } catch (error) {
      await ctx.reply(error);
      return next();
    }
  };
};

export default asyncWrapper;
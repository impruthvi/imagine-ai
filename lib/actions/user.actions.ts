"use server";

import { db } from "@/lib/db";
import { handleError } from "../utils";

// CREATE
export const createUser = async (user: CreateUserParams) => {
  try {
    const newUser = await db.user.create({ data: user });

    return newUser;
  } catch (error) {
    handleError(error);
  }
};

// READ
export const getUserById = async (clerkId: string) => {
  try {
    const user = await db.user.findUnique({
      where: {
        clerkId,
      },
    });

    if (!user) throw new Error("User not found");

    return user;
  } catch (error) {
    handleError(error);
  }
};

// UPDATE
export const updateUser = async (clerkId: string, user: UpdateUserParams) => {
  try {
    const updatedUser = await db.user.update({
      where: {
        clerkId,
      },
      data: user,
    });

    return updatedUser;
  } catch (error) {
    handleError(error);
  }
};

// DELETE
export const deleteUser = async (clerkId: string) => {
  try {
    // first check if user exists
    const user = await db.user.findUnique({
      where: {
        clerkId,
      },
    });

    if (!user) throw new Error("User not found");

    // then delete the user
    const deletedUser = await db.user.delete({
      where: {
        clerkId,
      },
    });

    return deletedUser;
  } catch (error) {
    handleError(error);
  }
};

// USE CREDITS
export const useCredits = async (clerkId: string, credits: number) => {
  try {
    const user = await db.user.findUnique({
      where: {
        clerkId,
      },
    });

    if (!user) throw new Error("User not found");

    const updatedUser = await db.user.update({
      where: {
        clerkId,
      },
      data: {
        creditBalance: credits,
      },
    });

    return updatedUser;
  } catch (error) {
    handleError(error);
  }
};

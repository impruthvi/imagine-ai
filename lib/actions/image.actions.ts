"use server";

import { revalidatePath } from "next/cache";
import { db } from "../db";
import { handleError } from "../utils";
import { redirect } from "next/navigation";

// ADD IMAGE
export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    const author = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!author) {
      throw new Error("User not found");
    }

    const newImage = await db.image.create({
      data: {
        ...image,
        authorId: author.id,
      },
    });

    revalidatePath(path);

    return newImage;
  } catch (error) {
    handleError(error);
  }
}

// UPDATE IMAGE
export async function updateImage({ image, userId, path }: UpdateImageParams) {
  try {
    const imageToUpdate = await db.image.findUnique({
      where: {
        id: image.id,
      },
    });

    if (!imageToUpdate || imageToUpdate.authorId !== userId) {
      throw new Error("Unauthorized or image not found");
    }

    const updatedImage = await db.image.update({
      where: {
        id: image.id,
      },
      data: image,
    });

    revalidatePath(path);

    return updatedImage;
  } catch (error) {
    handleError(error);
  }
}

// DELETE IMAGE
export async function deleteImage(imageId: string) {
  try {
    await db.image.delete({
      where: {
        id: imageId,
      },
    });
  } catch (error) {
    handleError(error);
  } finally {
    redirect("/");
  }
}

// GET IMAGE
export async function getImageById(imageId: string) {
  try {
    const image = await db.image.findUnique({
      where: {
        id: imageId,
      },
      include: {
        author: true,
      },
    });

    if (!image) throw new Error("Image not found");

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error);
  }
}

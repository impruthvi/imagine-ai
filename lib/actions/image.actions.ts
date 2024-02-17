"use server";

import { revalidatePath } from "next/cache";
import { db } from "../db";
import { handleError } from "../utils";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";

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
        config: JSON.stringify(image.config),
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

// GET IMAGES
export async function getAllImages({
  limit = 9,
  page = 1,
  searchQuery = "",
}: {
  limit?: number;
  page: number;
  searchQuery?: string;
}) {
  try {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    let expression = "folder=imagine";

    if (searchQuery) {
      expression += ` AND ${searchQuery}`;
    }

    const { resources } = await cloudinary.search
      .expression(expression)
      .execute();

    const resourceIds = resources.map((resource: any) => resource.public_id);

    let query = {};

    if (searchQuery) {
      query = {
        publicId: {
          in: resourceIds,
        },
      };
    }

    const skipAmount = (Number(page) - 1) * limit;

    const images = await db.image.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          {
            ...query,
          },
        ],
      },
      skip: skipAmount,
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
      include: {
        author: true,
      },
    });

    const totalImages = resources.length;
    const savedImages = images.length;
    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    };
  } catch (error) {
    handleError(error);
  }
}

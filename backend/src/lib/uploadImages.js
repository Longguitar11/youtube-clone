import cloudinary from "../config/cloudinary.js";

export const uploadImages = async (files) => {
    try {
        const uploadPromises = files.map((file) =>
            cloudinary.uploader.upload(file, {
                folder: "youtube_images_posts",
            })
        );

        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to upload images");
    }
};
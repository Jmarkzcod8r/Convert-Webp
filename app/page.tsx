'use client'

import React, { useState } from 'react';

const Page = () => {
    const [userImageSrc, setUserImageSrc] = useState<string>('');
    const [webpImageSrc, setWebpImageSrc] = useState<string>('');

    function convertImage(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files && event.target.files.length > 0) {
            const src = URL.createObjectURL(event.target.files[0]);
            setUserImageSrc(src);
            convertToWebp(src);
        }
    }

    async function convertToWebp(src: string) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx) {
            const userImage = new Image();
            userImage.src = src;

            userImage.onload = async () => {
                const maxWidth = 800; // Set maximum width for resizing
                const maxHeight = 600; // Set maximum height for resizing

                let width = userImage.width;
                let height = userImage.height;

                // Resize image if it exceeds maximum dimensions
                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    } else {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(userImage, 0, 0, width, height);

                // Convert the resized image to WebP format with compression and quality adjustment
                const webpImage = await canvas.toDataURL('image/webp', 0.8); // Adjust quality (0-1)
                setWebpImageSrc(webpImage);

                // Trigger download
                const downloadLink = document.createElement('a');
                downloadLink.href = webpImage;
                downloadLink.download = 'converted.webp';
                downloadLink.click();
            };
        }
    }

    return (
        <div className="bg-gray-100 min-h-[20em] flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-4">Convert Image to Webp format</h1>
            <input
                type="file"
                accept="image/*"
                name="convert"
                id="userImage"
                onChange={convertImage}
                className="mb-4"
            />
            {userImageSrc && (
                <div className="w-full md:w-3/4 lg:w-1/2 border border-gray-300 rounded-lg overflow-hidden shadow-md">
                    <div className="bg-gray-300 p-4">
                        <h2 className="text-lg font-bold mb-2">Original Image</h2>
                        <img src={userImageSrc} alt="Uploaded Image" id="Uimage" className="w-full" />
                    </div>
                </div>
            )}
            {webpImageSrc && (
                <div className="w-full md:w-3/4 lg:w-1/2 border border-gray-300 rounded-lg overflow-hidden shadow-md mt-4">
                    <div className="bg-gray-400 p-4">
                        <h2 className="text-lg font-bold mb-2">Webp Image</h2>
                        <img src={webpImageSrc} alt="Converted Image" id="Wimage" className="w-full" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Page;
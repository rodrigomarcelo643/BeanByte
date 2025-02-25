import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { firestore, storage, auth } from "../../config/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import Swal from "sweetalert2";

export default function Products() {
  const location = useLocation();
  const userData = location.state?.userData;

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please select an image.",
      });
      return;
    }
    setUploading(true);

    // Get the logged-in user's ID (if authenticated)
    const userId = auth.currentUser ? auth.currentUser.uid : null;

    if (!userId) {
      Swal.fire({
        icon: "error",
        title: "Authentication Required",
        text: "User is not authenticated.",
      });
      setUploading(false);
      return;
    }

    // Upload image to Firebase Storage
    const storageRef = ref(storage, `product_images/${imageFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    uploadTask.on(
      "state_changed",
      null,
      (error) => {
        console.error(error);
        setUploading(false);
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: "Failed to upload image.",
        });
      },
      async () => {
        // Get the image URL after upload
        const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);

        // Add product details to Firestore
        try {
          const docRef = await addDoc(collection(firestore, "products"), {
            productName,
            description,
            price,
            stock,
            imageUrl,
            category,
            userId,
            createdAt: new Date(),
          });

          console.log("Product added with ID: ", docRef.id);
          Swal.fire({
            icon: "success",
            title: "Product Added",
            text: "Your product has been successfully added!",
          }).then(() => {
            // Reset the form fields
            setProductName("");
            setDescription("");
            setPrice("");
            setStock("");
            setCategory("");
            setImageFile(null);
            setUploading(false);
          });
        } catch (error) {
          console.error("Error adding product: ", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to add product.",
          });
        }
      }
    );
  };

  return (
    <div className="bg-gray-100 w-full h-full ">
      <div className="max-w-3xl lg:relative lg:left-[-100px] mx-auto p-8 rounded-xl shadow-md bg-white">
        <h4 className="text-center text-xl font-semibold text-gray-700 mb-6">
          Add a New Product
        </h4>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="productName" className="block text-gray-600 mb-2">
              Product Name
            </label>
            <input
              id="productName"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
              className="w-full h-12 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#724E2C] placeholder:text-gray-500"
            />
          </div>

          {/* Price and Stock */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="price" className="block text-gray-600 mb-2">
                Price
              </label>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter product price"
                className="w-full h-12 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#724E2C] placeholder:text-gray-500"
              />
            </div>

            <div className="flex-1">
              <label htmlFor="stock" className="block text-gray-600 mb-2">
                Stock Quantity
              </label>
              <input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Enter stock quantity"
                className="w-full h-12 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#724E2C] placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-gray-600 mb-2">
              Product Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-12 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#724E2C] bg-gray-100 text-gray-700"
            >
              <option value="">Select Category</option>
              <option value="Coffee">Coffee</option>
              <option value="Tea">Tea</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-gray-600 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
              rows={6}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#724E2C] placeholder:text-gray-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block text-gray-600 mb-2">
              Upload Product Image
            </label>
            <input
              id="image"
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="w-full border border-gray-300 rounded-md py-2 px-3 cursor-pointer bg-gray-50"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#724E2C] text-white py-3 px-8 rounded-md hover:bg-[#c7a687] focus:outline-none"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

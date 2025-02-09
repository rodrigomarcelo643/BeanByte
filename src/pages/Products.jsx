import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { firestore, storage, auth } from "../../config/firebase"; // Import Firebase services
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import Swal from "sweetalert2"; // Import SweetAlert2

export default function Products() {
  const location = useLocation();
  const userData = location.state?.userData;

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [category, setCategory] = useState(""); // New state for category
  const [uploading, setUploading] = useState(false); // Track upload progress

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
            category, // Added category to product
            userId, // Associate product with the logged-in user
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
            setCategory(""); // Reset category
            setImageFile(null); // Reset the image file
            setUploading(false); // Reset uploading state
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
    <div className=" bg-gray-50 w-[96%] ml-10 mt-10 ">
      <div className="max-w-6xl mx-auto p-8 rounded-lg shadow-lg bg-white">
        <h4 className="text-center text-gray-800 mb-6">Add a New Product</h4>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label htmlFor="productName" className="block mb-2 text-gray-700">
              Product Name
            </label>
            <input
              id="productName"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
              className="w-full h-12 border rounded-[10px] border-[#724E2C] focus:outline-none focus:border-[#724E2C] placeholder:text-gray-400 placeholder:opacity-75 p-2"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block mb-2 text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
              rows={4}
              className="w-full h-32 border rounded-[10px] border-[#724E2C] focus:outline-none focus:border-[#724E2C] placeholder:text-gray-400 placeholder:opacity-75 p-2"
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block mb-2 text-gray-700">
              Price
            </label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter product price"
              className="w-full h-12 border rounded-[10px] border-[#724E2C] focus:outline-none focus:border-[#724E2C] placeholder:text-gray-400 placeholder:opacity-75 p-2"
            />
          </div>

          {/* Stock */}
          <div>
            <label htmlFor="stock" className="block mb-2 text-gray-700">
              Stock Quantity
            </label>
            <input
              id="stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Enter stock quantity"
              className="w-full h-12 border rounded-[10px] border-[#724E2C] focus:outline-none focus:border-[#724E2C] placeholder:text-gray-400 placeholder:opacity-75 p-2"
            />
          </div>

          {/* Product Category Dropdown */}
          <div>
            <label htmlFor="category" className="block mb-2 text-gray-700">
              Product Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-12 border rounded-[10px] border-[#724E2C] focus:outline-none focus:border-[#724E2C] bg-gray-100 text-gray-700 p-2"
            >
              <option value="">Select Category</option>
              <option value="Coffee">Coffee</option>
              <option value="Tea">Tea</option>
              <option value="Snacks">Snacks</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block mb-2 text-gray-700">
              Upload Product Image
            </label>
            <input
              id="image"
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="w-[200px] text-sm text-gray-700 border-2 border-[#724E2C] rounded-md py-2 px-4 cursor-pointer focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#724E2C] text-white py-3 px-8 cursor-pointer hover:bg-[#c7a687] rounded-md"
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

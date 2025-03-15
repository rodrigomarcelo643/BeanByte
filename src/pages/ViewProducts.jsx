import React, { useState, useEffect } from "react";
import { firestore, auth } from "../../config/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Swal from "sweetalert2";
import { FaEdit, FaTrashAlt } from "react-icons/fa"; // Added icons for edit and delete buttons

export default function ViewProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const userId = auth.currentUser ? auth.currentUser.uid : null;
      if (!userId) {
        Swal.fire({
          icon: "error",
          title: "Authentication Required",
          text: "You must be logged in to view your products.",
        });
        return;
      }

      const q = query(
        collection(firestore, "products"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);

      const productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(productsList);
      setFilteredProducts(productsList);

      const uniqueCategories = [
        ...new Set(productsList.map((product) => product.category)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching products: ", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch products.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    const confirmDelete = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "This will permanently delete the product.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirmDelete.isConfirmed) {
      try {
        await deleteDoc(doc(firestore, "products", productId));
        Swal.fire({
          icon: "success",
          title: "Product Deleted",
          text: "The product has been successfully deleted.",
        });
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product: ", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete product.",
        });
      }
    }
  };

  const handleSearch = () => {
    let filtered = products;

    if (category) {
      filtered = filtered.filter((product) => product.category === category);
    }

    if (search) {
      filtered = filtered.filter((product) =>
        product.productName.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleEdit = async (product) => {
    const storage = getStorage();

    const { value: formValues } = await Swal.fire({
      title: "Edit Product",
      html: `
        <div class="space-y-4 p-4">
          <input id="productName" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Product Name" value="${product.productName}" />
          <input id="price" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Price" value="${product.price}" />
          <input id="stock" class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Stock" value="${product.stock}" />

          <div class="upload-container flex items-center justify-between space-x-4">
            <input type="file" id="imageFile" class="upload-input hidden" />
            <label for="imageFile" class="upload-label cursor-pointer text-gray-700 border-2 border-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 transition-all">
              Choose Image (Optional)
            </label>
          </div>
        </div>
      `,
      customClass: {
        popup: "swal2-popup-custom",
        title: "swal2-title-custom",
        htmlContainer: "swal2-html-container-custom",
      },
      focusConfirm: false,
      preConfirm: () => {
        return {
          productName: document.getElementById("productName").value,
          price: document.getElementById("price").value,
          stock: document.getElementById("stock").value,
          imageFile: document.getElementById("imageFile").files[0],
        };
      },
    });

    if (formValues) {
      const { productName, price, stock, imageFile } = formValues;

      // Update product with new values
      let newImageUrl = product.imageUrl;

      if (imageFile) {
        const imageRef = ref(
          storage,
          `productImages/${Date.now()}_${imageFile.name}`
        );
        try {
          const uploadResult = await uploadBytes(imageRef, imageFile);
          newImageUrl = await getDownloadURL(uploadResult.ref);
        } catch (error) {
          console.error("Error uploading image: ", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to upload the image.",
          });
          return;
        }
      }

      try {
        await updateDoc(doc(firestore, "products", product.id), {
          productName: productName || product.productName,
          price: parseFloat(price) || product.price,
          stock: parseInt(stock) || product.stock,
          imageUrl: newImageUrl || product.imageUrl,
        });

        Swal.fire({
          icon: "success",
          title: "Product Updated",
          text: "The product has been successfully updated.",
        });

        fetchProducts();
      } catch (error) {
        console.error("Error updating product: ", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update product.",
        });
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [search, category]);

  return (
    <div className="p-6 sm:p-8 bg-white min-h-screen w-full lg:w-[85%] lg:ml-3">
      <div className="flex justify-between items-center mb-6">
        <div className="w-1/2">
          <input
            type="text"
            placeholder="Search Products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-brown-500 focus:outline-none"
          />
        </div>

        <div className="w-1/4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full py-2 px-4 border border-gray-300 rounded-md bg-gray-100 text-gray-700 focus:ring-2 focus:ring-brown-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center text-lg">
          Loading...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center text-gray-600">No products found.</div>
      ) : (
        <div className="flex flex-wrap justify-start gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white p-4 rounded-lg shadow-lg w-full sm:w-[280px] md:w-[300px] lg:w-[300px] xl:w-[320px] relative"
            >
              {/* Edit and Delete buttons with icons */}
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition duration-200"
                >
                  <FaEdit className="text-white" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition duration-200"
                >
                  <FaTrashAlt className="text-white" />
                </button>
              </div>

              {/* Product Image */}
              <div className="flex justify-center mb-4">
                <img
                  src={product.imageUrl}
                  alt={product.productName}
                  className="w-full mt-8 object-cover rounded-md"
                />
              </div>

              {/* Product Name */}
              <h3 className="text-2xl text-center font-semibold text-gray-800 truncate">
                {product.productName}
              </h3>

              {/* Product Price */}
              <p className="text-gray-600 mt-2">
                <strong>Price:</strong> ₱ {parseFloat(product.price).toFixed(2)}
              </p>

              {/* Product Stock */}
              <p className="text-gray-600 mt-1">
                <strong>Stock:</strong> {product.stock}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { useNavigate, useParams } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { app } from "../firebase.js";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

function CreateListing() {
  const navigate = useNavigate();
  const { id: listingId } = useParams("id");

  const { currentUser } = useSelector((state) => state.user);

  const [files, setFiles] = useState([]);
  const [imageUploadError, setImageUploadError] = useState("");
  const [loadingUpload, setLoadingUpload] = useState(false);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountedPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
    imageUrls: [],
  });

  const getListing = async () => {
    const res = await fetch(`/api/listing/get/${listingId}`);
    const data = await res.json();

    if (data.success === false) {
      console.log(data.message);
      return;
    }

    setFormData(data);
  };

  useEffect(() => {
    getListing();
  }, []);

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setLoadingUpload(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setError("");
          setLoadingUpload(false);
        })
        .catch((err) => {
          setImageUploadError("Image upload failed (2mb max per image");
          setLoadingUpload(false);
        });
    } else {
      setImageUploadError("You must upload between 1 and 6 images per listing");
      setLoadingUpload(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    if (e.target.id === "sale" || e.target.id === "rent") {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === "number" ||
      e.target.type === "text" ||
      e.target.type === "textarea"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError("You must upload at least one image");
      if (Number(formData.regularPrice) < Number(formData.discountedPrice))
        return setError(
          "O preço de desconto deve ser inferior ao preço normal"
        );
      setLoading(true);
      setError(false);

      const res = await fetch(`/api/listing/update/${listingId}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
          discountedPrice: formData.regularPrice - formData.discountedPrice,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success === false) {
        setError(data.message);
      }
      toast.success("Anúncio atualizado com sucesso!", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      navigate(`/listing/${listingId}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="p-3 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Update listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            className="border p-3 rounded-lg"
            type="text"
            placeholder="Name"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            className="border p-3 rounded-lg"
            type="text"
            placeholder="Description"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            className="border p-3 rounded-lg"
            type="text"
            placeholder="Address"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                className="w-5 cursor-pointer"
                type="checkbox"
                id="sale"
                onChange={handleChange}
                checked={formData.type === "sale"}
              />
              <span>Sale</span>
            </div>
            <div className="flex gap-2">
              <input
                className="w-5 cursor-pointer"
                type="checkbox"
                id="rent"
                onChange={handleChange}
                checked={formData.type === "rent"}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                className="w-5 cursor-pointer"
                type="checkbox"
                id="parking"
                onChange={handleChange}
                checked={formData.parking}
              />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input
                className="w-5 cursor-pointer"
                type="checkbox"
                id="furnished"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                className="w-5 cursor-pointer"
                type="checkbox"
                id="offer"
                onChange={handleChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                className="p-3 border border-gray-300 rounded-lg"
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="p-3 border border-gray-300 rounded-lg"
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="p-3 border border-gray-300 rounded-lg"
                type="number"
                id="regularPrice"
                min="20"
                max="10000000"
                required
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                <span className="text-xs">($ / Month)</span>
              </div>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  className="p-3 border border-gray-300 rounded-lg"
                  type="number"
                  id="discountedPrice"
                  min="0"
                  max="1000000"
                  required
                  onChange={handleChange}
                  value={formData.discountedPrice}
                />
                <div className="flex flex-col items-center">
                  <p>Discounted price</p>
                  <span className="text-xs">($ / Month)</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold ">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              onChange={(e) => setFiles(e.target.files)}
              className="p-3 border border-gray-300 rounded w-full cursor-pointer"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              disabled={loadingUpload}
              type="button"
              onClick={handleImageSubmit}
              className="p-3 text-green-700 border border-green-700 rounded uppecase hover:shadow-lg disabled:opacity-80"
            >
              {loadingUpload ? "Uploading..." : "Upload"}
            </button>
          </div>
          <p className="text-red-700 text-center text-sm">
            {imageUploadError !== undefined && imageUploadError}
          </p>
          {formData.imageUrls !== undefined &&
            formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                className="flex justify-between border-gray-300 rounded-lg border-2 items-center p-3"
                key={url}
              >
                <img
                  className="w-80 h-40 object-cover rounded-lg"
                  src={url}
                  alt="listing image"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75 hover:border hover:border-red-700 "
                >
                  Delete
                </button>
              </div>
            ))}
          <button
            disabled={loading || loadingUpload}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading ? "Updating..." : "Update listing"}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}

export default CreateListing;

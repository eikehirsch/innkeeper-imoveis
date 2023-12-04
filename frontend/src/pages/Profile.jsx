import { useSelector, useDispatch } from "react-redux";
import { useRef, useState, useEffect } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Link } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { app } from "../firebase.js";

import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from "../redux/user/userSlice.js";

function Profile() {
  const dispatch = useDispatch();

  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);

  const [file, setFile] = useState(undefined);
  const [filePercentage, setFilePercentage] = useState(0);
  const [fileError, setFileError] = useState(false);

  const [updateSuccess, setUpdateSucess] = useState(false);

  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);

  const [formData, setFormData] = useState({});

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePercentage(progress.toFixed(0));
      },
      (error) => setFileError(true),

      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, avatar: downloadURL });
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });

      const data = res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }

      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch("/api/auth/signout");
      const data = await res.json();

      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }

      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`api/user/update/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSucess(true);

      toast.success("Usuário atualizado com sucesso!", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();

      if (data.success === false) {
        setShowListingsError(true);
        return;
      }

      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleDeleteListing = async (listingId) => {
    const res = await fetch(`/api/listing/delete/${listingId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (data.success === false) {
      setShowListingsError(true);
      return;
    }

    toast.success("Anúncio deletado com sucesso!", {
      position: "top-center",
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });

    handleShowListings();
  };

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Perfil</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
          type="file"
          ref={fileRef}
          accept="image/*"
        />
        <img
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
          src={formData.avatar || currentUser.avatar}
          alt="profile"
          onClick={() => fileRef.current.click()}
        />
        <p className="text-sm self-center">
          {fileError ? (
            <span className="text-red-700">
              Error in image upload (image must be less than 2mb)
            </span>
          ) : filePercentage > 0 && filePercentage < 100 ? (
            <span className="text-slate-700">Uploading {filePercentage}%</span>
          ) : filePercentage === "100" ? (
            <span className="text-green-700">Image successfully uploaded</span>
          ) : (
            ""
          )}
        </p>
        <input
          className="border p-3 rounded-lg"
          type="text"
          placeholder="Username"
          id="username"
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        <input
          className="border p-3 rounded-lg"
          type="email"
          placeholder="E-mail"
          id="email"
          defaultValue={currentUser.email}
          onChange={handleChange}
        />
        <input
          className="border p-3 rounded-lg"
          type="password"
          placeholder="Password"
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-75"
        >
          {loading ? "Carregando" : "Atualizar"}
        </button>
        <Link
          to="/create-listing"
          className="bg-green-700 text-white p-3 uppercase rounded-lg text-center hover:opacity-90"
        >
          Criar anúncio
        </Link>
      </form>
      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer"
        >
          Deletar conta
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Logout
        </span>
      </div>
      <p className="text-red-700 mt-4">{error ? error : ""}</p>
      <p className="text-green-700 mt-4">
        {updateSuccess ? "Usuário atualizado com sucesso" : ""}
      </p>
      {userListings && userListings.length === 0 && (
        <button onClick={handleShowListings} className="text-green-700 w-full mt-5 border border-green-500">
          Mostrar meus anúncios
        </button>
      )}
      <p className="text-red-700 mt-5">
        {showListingsError ? "Error showing listings" : ""}
      </p>

      <div className="flex flex-col gap-2">
        <h1 className="text-center my-7 text-2xl font-semibold">
          {userListings && userListings.length > 0 && "Meus anúncios"}
        </h1>
        {userListings &&
          userListings.length > 0 &&
          userListings.map((listing) => (
            <div
              className="border border-green-500 rounded-lg p-3 flex items-center justify-between"
              key={listing._id}
            >
              <Link
                className="flex items-center justify-between gap-3"
                to={`/listing/${listing._id}`}
              >
                <img
                  className="h-30 w-40 object-cover"
                  src={listing.imageUrls[0]}
                  alt="listing cover"
                />
                <p className="text-slate-700 font-semibold hover:underline truncate">
                  {listing.name}
                </p>
              </Link>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleDeleteListing(listing._id)}
                  className="text-red-700 uppercase"
                >
                  Deletar
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-green-700 uppercase">Editar</button>
                </Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Profile;

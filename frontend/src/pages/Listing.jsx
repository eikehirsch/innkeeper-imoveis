import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";

import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from "react-icons/fa";

import ContactLandlord from "../components/ContactLandlord";

function Listing() {
  SwiperCore.use([Navigation]);

  const { currentUser } = useSelector((state) => state.user);

  const { id: listingId } = useParams();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const getListing = async () => {
    setLoading(true);
    const res = await fetch(`/api/listing/get/${listingId}`);
    const data = await res.json();

    if (data.success === false) {
      setError(true);
      return;
    }

    setListing(data);
  };

  useEffect(() => {
    try {
      getListing();
    } catch (error) {
      console.log("2123");
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  return (
    <main>
      {loading && <p className="text-center my-7 text-2xl">Carregando...</p>}
      {error && (
        <p className="text-center my-7 text-2xl">Something went wrong!</p>
      )}
      {listing && (
        <div>
          <Swiper navigation>
            {listing.imageUrls.map((imageUrl) => (
              <SwiperSlide key={imageUrl}>
                <div
                  className="h-[550px]"
                  style={{
                    background: `url(${imageUrl}) center no-repeat`,
                    backgroundSize: "cover",
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer">
            <FaShare
              className="text-slate-500"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}
            />
          </div>
          {copied && (
            <p className="fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2">
              Link copiado!
            </p>
          )}
          <div className="flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4">
            <p className="text-2xl font-semibold flex gap-1">
              {listing.name} - R$ {""}
              <p>
                {listing.offer
                  ? `${(
                      listing.discountedPrice
                    ).toLocaleString("pt-br")}`
                  : listing.regularPrice.toLocaleString("pt-br")}{" "}
              </p>
              {listing.type === "rent" && "/ mês"}
            </p>
            <p className="flex items-center mt-2 gap-2 text-slate-600  text-sm">
              <FaMapMarkerAlt className="text-green-700" />
              {listing.address}
            </p>
            <div className="flex gap-4">
              <p className="bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                {listing.type === "rent" ? "Alugável" : "À venda"}
              </p>
              {listing.offer && (
                <p className="bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md">
                  Desconto de R$
                  {(listing.regularPrice - listing.discountedPrice).toLocaleString("pt-br")}{" "}
                </p>
              )}
            </div>
            <p className="text-slate-800">
              <span className="font-semibold text-black">Descrição - </span>
              {listing.description}
            </p>
            <ul className="flex items-center gap-4 sm:gap-6 text-green-900 font-semibold text-sm flex-wrap">
              <li className="flex items-center gap-2 whitespace-nowrap">
                <FaBed className="text-lg" />
                {listing.bedrooms > 1
                  ? `${listing.bedrooms} quartos`
                  : `${listing.bedrooms} quarto`}
              </li>
              <li className="flex items-center gap-2 whitespace-nowrap">
                <FaBath className="text-lg" />
                {listing.bathrooms > 1
                  ? `${listing.bathrooms} banheiros`
                  : `${listing.bathrooms} banheiro`}
              </li>
              <li className="flex items-center gap-2 whitespace-nowrap">
                <FaParking className="text-lg" />
                {listing.parking ? "Com estacionamento" : "Sem estacionamento"}
              </li>
              <li className="flex items-center gap-2 whitespace-nowrap">
                <FaChair className="text-lg" />
                {listing.furnished ? "Mobiliado" : "Não mobiliado"}
              </li>
            </ul>
            {currentUser &&
              listing.userRef !== currentUser._id &&
              !showContact && (
                <button
                  onClick={() => setShowContact(true)}
                  className="bg-slate-700 py-2 text-white rounded-lg uppercase hover:opacity-95"
                >
                  Contatar responsável
                </button>
              )}
            {showContact && <ContactLandlord listing={listing} />}
          </div>
        </div>
      )}
    </main>
  );
}

export default Listing;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";

import ListingItem from "../components/ListingItem";

function Home() {
  SwiperCore.use([Navigation]);

  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);

  const getOfferListings = async () => {
    try {
      const res = await fetch(`/api/listing/get?offer=true&limit=3`);
      const data = await res.json();

      setOfferListings(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getRentListings = async () => {
    try {
      const res = await fetch(`/api/listing/get?type=rent&limit=3`);
      const data = await res.json();

      setRentListings(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getSaleListings = async () => {
    try {
      const res = await fetch(`/api/listing/get?type=sale&limit=3`);
      const data = await res.json();

      setSaleListings(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getOfferListings();
    getRentListings();
    getSaleListings();
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto">
        <h1 className="text-slate-700 font-bold text-3xl lg:text-6xl">
          Encontre seu próximo lar{" "}
          <span className="text-slate-400">perfeito</span>
          <br />
          com facilidade
        </h1>
        <div className="text-gray-400 text-xs sm:text-xl">
          InnKeeper é o melhor lugar para encontrar seu próximo lar para morar.
          <br />
          Temos uma ampla variedade de locações para você escolher.
        </div>
        <Link
          className="text-xs sm:text-xl text-blue-800 font-bold hover:underline"
          to={"/search"}
        >
          Vamos começar...
        </Link>
      </div>

      <Swiper navigation>
        {offerListings !== undefined &&
          offerListings.length > 0 &&
          offerListings.map((offerListing) => (
            <SwiperSlide key={offerListing._id}>
              <div
                style={{
                  background: `url(${offerListing.imageUrls[0]}) center no-repeat`,
                  backgroundSize: "cover",
                }}
                className="h-[500px]"
                key={offerListing._id}
              ></div>
            </SwiperSlide>
          ))}
      </Swiper>

      <div className="max-w-6xl mx-auto flex flex-col p-3 gap-8 my-10">
        {offerListings !== undefined && offerListings.length > 0 && (
          <div className="">
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">
                Promoções recentes
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={"/search?offer=true"}
              >
                Mostrar mais promoções
              </Link>
              <div className="flex flex-wrap gap-4 mt-4">
                {offerListings !== undefined &&
                  offerListings.length > 0 &&
                  offerListings.map((offerListing) => (
                    <ListingItem
                      listing={offerListing}
                      key={offerListing._id}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}
        {rentListings !== undefined && rentListings.length > 0 && (
          <div className="">
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">
                Alugáveis recentes
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={"/search?type=rent"}
              >
                Mostrar mais alugáveis
              </Link>
              <div className="flex flex-wrap gap-4 mt-4">
                {rentListings !== undefined &&
                  rentListings.length > 0 &&
                  rentListings.map((rentListing) => (
                    <ListingItem listing={rentListing} key={rentListing._id} />
                  ))}
              </div>
            </div>
          </div>
        )}
        {saleListings !== undefined && saleListings.length > 0 && (
          <div className="">
            <div className="my-3">
              <h2 className="text-2xl font-semibold text-slate-600">
                À venda recentes
              </h2>
              <Link
                className="text-sm text-blue-800 hover:underline"
                to={"/search?type=rent"}
              >
                Mostrar mais à venda
              </Link>
              <div className="flex flex-wrap gap-4 mt-4">
                {saleListings !== undefined &&
                  saleListings.length > 0 &&
                  saleListings.map((offerListing) => (
                    <ListingItem
                      listing={offerListing}
                      key={offerListing._id}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;

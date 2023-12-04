import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ListingItem from "../components/ListingItem";

function Search() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [listings, setListings] = useState(null);
  const [searchData, setSearchData] = useState({
    searchTerm: "",
    type: "all",
    parking: false,
    furnished: false,
    offer: false,
    sort: "createdAt",
    order: "desc",
  });

  useEffect(() => {
    window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
    const urlParams = new URLSearchParams(location.search);

    const searchTermFromUrl = urlParams.get("searchTerm");
    const typeFromUrl = urlParams.get("type");
    const parkingFromUrl = urlParams.get("parking");
    const furnishedFromUrl = urlParams.get("furnished");
    const offerFromUrl = urlParams.get("offer");
    const sortFromUrl = urlParams.get("sort");
    const orderFromUrl = urlParams.get("order");

    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSearchData({
        searchTerm: searchTermFromUrl || "",
        type: typeFromUrl || "all",
        parking: parkingFromUrl === "true" ? true : false,
        furnished: furnishedFromUrl === "true" ? true : false,
        offer: offerFromUrl === "true" ? true : false,
        sort: sortFromUrl || "createAt",
        order: orderFromUrl || "desc",
      });
    }

    getListings();
  }, [location.search]);

  const handleChange = (e) => {
    if (
      e.target.id === "all" ||
      e.target.id === "rent" ||
      e.target.id === "sale"
    ) {
      setSearchData({ ...searchData, type: e.target.id });
    }

    if (e.target.id === "searchTerm") {
      setSearchData({ ...searchData, searchTerm: e.target.value });
    }

    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setSearchData({
        ...searchData,
        [e.target.id]:
          e.target.checked || e.target.checked === "true" ? true : false,
      });
    }

    if (e.target.id === "sort_order") {
      const sort = e.target.value.split("_")[0] || "createdAt";
      const order = e.target.value.split("_")[1] || "desc";

      setSearchData({ ...searchData, sort, order });
    }
  };

  const getListings = async () => {
    setLoading(true);

    const urlParams = new URLSearchParams(location.search);
    const searchQuery = urlParams.toString();

    const res = await fetch(`api/listing/get?${searchQuery}`);
    const data = await res.json();

    if (data.length > 8) {
      setShowMore(true);
    } else {
      setShowMore(false);
    }

    setListings(data);
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set("searchTerm", searchData.searchTerm);
    urlParams.set("type", searchData.type);
    urlParams.set("parking", searchData.parking);
    urlParams.set("furnished", searchData.furnished);
    urlParams.set("offer", searchData.offer);
    urlParams.set("sort", searchData.sort);
    urlParams.set("order", searchData.order);

    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;
    const startIndex = numberOfListings;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", startIndex);
    const searchQuery = urlParams.toString();

    const res = await fetch(`api/listing/get?${searchQuery}`);
    const data = await res.json();

    if (data.length < 9) {
      setShowMore(false);
    }

    setListings([...listings, ...data]);
  };

  return (
    <div className="flex flex-col md:flex-row w-full md:min-h-screen">
      <div className="p-7 border-b-2 md:border-r-2">
        <form onSubmit={handleSubmit} className="w-80 flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">
              Procure pelo título:{" "}
            </label>
            <input
              className="border rounded-lg p-3 w-full"
              type="text"
              id="searchTerm"
              placeholder="Título..."
              value={searchData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap border bg-slate-200 p-3 rounded-lg">
            <label className="font-semibold">Tipo: </label>
            <div className="flex gap-1">
              <input
                className="w-5"
                type="checkbox"
                id="all"
                checked={searchData.type === "all"}
                onChange={handleChange}
              />
              <span>Aluguel ou venda</span>
            </div>
            <div className="flex gap-1">
              <input
                className="w-5"
                type="checkbox"
                id="rent"
                checked={searchData.type === "rent"}
                onChange={handleChange}
              />
              <span>Aluguel</span>
            </div>
            <div className="flex gap-1">
              <input
                className="w-5"
                type="checkbox"
                id="sale"
                checked={searchData.type === "sale"}
                onChange={handleChange}
              />
              <span>Venda</span>
            </div>
            <div className="flex gap-1">
              <input
                className="w-5"
                type="checkbox"
                id="offer"
                checked={searchData.offer}
                onChange={handleChange}
              />
              <span>Promoção</span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap bg-slate-200 p-3 rounded-lg">
            <label className="font-semibold">Serviços: </label>
            <div className="flex gap-1">
              <input
                className="w-5"
                type="checkbox"
                id="parking"
                checked={searchData.parking}
                onChange={handleChange}
              />
              <span>Com estacionamento</span>
            </div>
            <div className="flex gap-1">
              <input
                className="w-5"
                type="checkbox"
                id="furnished"
                checked={searchData.furnished}
                onChange={handleChange}
              />
              <span>Mobiliado</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-200 p-3 rounded-lg">
            <label className="font-semibold">Organizar por:</label>
            <select
              className="border rounded-lg p-1 outline-none"
              name=""
              id="sort_order"
              onChange={handleChange}
              defaultValue={"createdAt_desc"}
              value={`${searchData.sort}_${searchData.order}`}
            >
              <option value="regularPrice_desc">Mais caros</option>
              <option value="regularPrice_asc">Mais baratos</option>
              <option value="createdAt_desc">Mais recentes</option>
              <option value="createdAt_asc">Mais antigos</option>
            </select>
          </div>
          <button className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95">
            Procurar
          </button>
        </form>
      </div>
      <div className="flex flex-col gap-4 px-5 flex-1 text-center">
        <h1 className="text-3xl w-full font-semibold border-b p-3 text-slate-700 mt-5">
          Anúncios encontrados:
        </h1>
        <div className="flex gap-5 flex-wrap justify-center mb-4">
          {listings !== undefined && listings?.length === 0 && (
            <p className="text-xl text-slate-700">Nenhum anúncio encontrado!</p>
          )}
          {loading && (
            <p className="text-xl text-slate-700 text-center w-full">
              Carregando...
            </p>
          )}
          {listings?.length > 0 &&
            listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}

          {showMore && (
            <button
              className="text-green-700 hover:underline p-2 text-center w-full border border-green-700"
              onClick={onShowMoreClick}
            >
              Mostrar mais
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;

import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";

import {
  FaBath,
  FaBed
} from "react-icons/fa";

function ListingItem({ listing }) {

  console.log('asdasdasd', listing)

  return (
    <div className="w-full sm:w-[330px] bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg">
      <Link to={`/listing/${listing._id}`}>
        <img
          className="h-[320px] sm:h-[200px] w-full object-cover hover:scale-105 transition-scale duration-300"
          src={listing.imageUrls[0]}
          alt="Listing hover"
        />
        <div className="p-3 flex flex-col gap-2 w-full">
          <p className="text-lg font-semibold text-slate-700 truncate text-center">
            {listing.name}
          </p>
          <div className="flex items-center gap-1">
            <MdLocationOn className="h-5 w-5 text-green-700" />
            <p className="text-sm text-gray truncate w-full">
              {listing.address}
            </p>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {listing.description}
          </p>
          <p className="text-slate-500 mt-2 font-semibold text-center">
            R$ {listing.offer
              ? (listing.regularPrice - listing.discountedPrice).toLocaleString("pt-br")
              : listing.regularPrice.toLocaleString("pt-br")}
              {listing.type === 'rent' && ' / mensal'}
          </p>
          <div className="text-slate-700 flex gap-4 justify-center">
               <div className="flex gap-1 items-center font-bold text-sm">
                    {listing.bedrooms} <FaBath />
               </div>
               <div className="flex gap-1 items-center font-bold text-sm">
                    {listing.bathrooms} <FaBed />
               </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ListingItem;

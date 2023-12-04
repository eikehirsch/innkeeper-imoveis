import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function ContactLandlord({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState("");

  const getUser = async () => {
    try {
      const res = await fetch(`/api/user/${listing.userRef}`);
      const data = await res.json();
      setLandlord(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUser();
  }, [listing.userRef]);

  return (
    <div>
      {landlord && (
        <div className="flex flex-col gap-2 mt-6">
          <div>
            Entre em contato com <span>{landlord.username}</span> sobre
            <span className="font-semibold capitalize"> {listing.name}</span>
          </div>
          <textarea
            className="w-full border p-2 rounded-lg outline-none"
            onChange={(e) => setMessage(e.target.value)}
            name="message"
            id="message"
            rows="2"
            placeholder="Enter new message here"
            value={message}
          ></textarea>
          <Link
            to={`mailto:${landlord.email}?subject=Sobre ${listing.name}&body=${message}`}
            className="bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95"
          >
            Enviar mensagem
          </Link>
        </div>
      )}
    </div>
  );
}

export default ContactLandlord;

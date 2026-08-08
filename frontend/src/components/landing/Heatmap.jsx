import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { loadAthensData } from "./data/loadAthensData";

export default function Heatmap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;
    if (!mapRef.current) return;

    let cancelled = false; 

    // Δημιουργία χάρτη
    const map = L.map(mapRef.current, {
      center: [37.9838, 23.7275],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    
    // ΦΟΡΤΩΣΗ  ΔΕΔΟΜΕΝΩΝ ΚΑΙ ΣΧΕΔΙΑΣΗ ΖΩΝΩΝ
   

    loadAthensData()
      .then((athensData) => {
        if (cancelled) return;

        athensData.forEach((area) => {
          const radius = Number(area.radius);

          if (!Number.isFinite(radius)) {
            console.warn("Μη έγκυρο radius στο area:", area);
            return;
          }

          L.circle(area.position, {
            radius,
            stroke: false,
            fillColor: area.color,
            fillOpacity: 0.16,
          }).addTo(map);

          L.circle(area.position, {
            radius: radius * 0.45,
            stroke: false,
            fillColor: area.color,
            fillOpacity: 0.22,
          }).addTo(map);

          L.marker(area.position, {
            icon: L.divIcon({
              className: "",
              html: `
                <div style="
                  position: absolute;
                  left: 0;
                  top: 0;
                  transform: translate(-50%, -50%);
                  background: ${area.color};
                  color: white;
                  padding: 5px 10px;
                  border-radius: 999px;
                  font-family: Arial, sans-serif;
                  font-size: 11px;
                  font-weight: 700;
                  white-space: nowrap;
                  width: max-content;
                  box-shadow: 0 3px 10px rgba(0,0,0,.25);
                  border: 2px solid white;
                ">
                  ${area.name} · €${area.price}/m²
                </div>
              `,
              iconSize: [0, 0],
              iconAnchor: [0, 0],
            }),
          }).addTo(map);
        });

     

        const legend = L.control({ position: "bottomright" });

        legend.onAdd = () => {
          const div = L.DomUtil.create("div");

          div.innerHTML = `
            <div style="
              background: rgba(255,255,255,.94);
              padding: 10px 12px;
              border-radius: 10px;
              box-shadow: 0 3px 15px rgba(0,0,0,.15);
              font-family: Arial, sans-serif;
              font-size: 11px;
              color: #16212B;
            ">
              <div style="font-weight:700; margin-bottom:7px;">
                Ενδεικτικό ενοίκιο €/m²
              </div>
              <div style="margin-bottom:4px;">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#B33F30;margin-right:5px;"></span>
                Ακριβό
              </div>
              <div style="margin-bottom:4px;">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#C98A3E;margin-right:5px;"></span>
                Μεσαίο
              </div>
              <div>
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#4C7A6D;margin-right:5px;"></span>
                Προσιτό
              </div>
            </div>
          `;

          return div;
        };

        legend.addTo(map);
      })
      .catch((err) => {
        console.error("Αποτυχία φόρτωσης cleaned_properties.csv:", err);
      });


    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,.12)",
        border: "1px solid #E5E7EB",
      }}
    />
  );
}
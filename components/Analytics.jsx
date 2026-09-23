import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { CONSENT_KEY, initializePixel, readStorage, setPixelConsent, trackPageView, writeStorage } from "../lib/pixel";

const Context = createContext({ ready: false, allowOrderPage: () => {} });
export const useAnalytics = () => useContext(Context);

export default function Analytics({ children }) {
  const router = useRouter();
  const [consent, setConsent] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [orderAllowed, setOrderAllowed] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const lastPage = useRef(null);
  const pageAllowed = router.pathname === "/" || (router.pathname === "/obrigado" && orderAllowed);

  useEffect(() => { setConsent(readStorage(CONSENT_KEY)); setLoaded(true); }, []);
  useEffect(() => {
    const granted = consent === "granted" && pageAllowed;
    setPixelConsent(granted);
    const active = granted && initializePixel(customer);
    setReady(active);
    if (active && lastPage.current !== router.pathname) {
      trackPageView(); lastPage.current = router.pathname;
    }
  }, [consent, pageAllowed, router.pathname, customer]);

  function choose(value) { writeStorage(CONSENT_KEY, value); setConsent(value); setEditing(false); }

  function allowOrderPage(customerData) {
    writeStorage(CONSENT_KEY, "granted");
    setCustomer(customerData);
    setOrderAllowed(true);
    setConsent("granted");
  }

  return <Context.Provider value={{ ready, allowOrderPage }}>
    {children}
    <button type="button" className="privacy-settings" onClick={() => setEditing(true)}>Preferências de privacidade</button>
    {loaded && (!consent || editing) && <aside className="cookie-banner" aria-label="Preferências de privacidade">
      <div><strong>Podemos medir suas visitas?</strong><p>Com sua permissão, usamos o Meta Pixel para medir visitas, cliques no WhatsApp e compras e avaliar nossos anúncios. Você pode recusar e continuar comprando normalmente.</p></div>
      <div className="cookie-actions"><button className="btn btn-primary" onClick={() => choose("granted")}>Aceitar medição</button><button className="btn privacy-reject" onClick={() => choose("denied")}>Recusar</button></div>
    </aside>}
  </Context.Provider>;
}

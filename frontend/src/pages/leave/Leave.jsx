import { useOutletContext } from "react-router-dom";
import { GenericModulePage } from "../../components/PagePrimitives.jsx";
export default function Leave() { const context = useOutletContext(); return <GenericModulePage {...context} />; }

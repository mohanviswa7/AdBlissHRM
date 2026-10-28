import { useOutletContext } from "react-router-dom";
import { GenericModulePage } from "../../components/PagePrimitives.jsx";
export default function Settings() { const context = useOutletContext(); return <GenericModulePage {...context} />; }

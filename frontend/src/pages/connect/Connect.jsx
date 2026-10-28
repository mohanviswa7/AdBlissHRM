import { useOutletContext } from "react-router-dom";
import { GenericModulePage } from "../../components/PagePrimitives.jsx";
export default function Connect() { const context = useOutletContext(); return <GenericModulePage {...context} />; }

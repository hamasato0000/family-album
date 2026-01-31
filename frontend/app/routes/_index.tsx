import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";

export default function Index() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate("/albums", { replace: true });
    }, [navigate]);

    return null;
}

export const onRequestGet = async (context) => {
    const { request, env } = context;
    const visitors = Math.floor(Math.random() * 20) + 10;
    const patients = Math.floor(Math.random() * 5) + 2;

    return new Response(JSON.stringify({
        visitors,
        patients,
        note: "Statistiques en temps réel (Simulation Cloudflare)"
    }), {
        headers: { "Content-Type": "application/json" }
    });
};

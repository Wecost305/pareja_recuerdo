document.addEventListener('DOMContentLoaded', () => {
    // Reloj para el HUD Retro
    function updateClock() {
        const now = new Date();
        document.getElementById('hud-date').innerText = now.toLocaleDateString('es-ES', { month: '2-digit', day: '2-digit' });
        document.getElementById('hud-time').innerText = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    updateClock();
    setInterval(updateClock, 60000);

    const urlParams = new URLSearchParams(window.location.search);
    const idCasete = urlParams.get('id');

    if(idCasete) {
        const SUPABASE_URL = 'https://elvssfovlidfpqzbiciq.supabase.co'; 
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsdnNzZm92bGlkZnBxemJpY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NzQxMTEsImV4cCI6MjEwMzM1MDExMX0.t2ohC5HYGRuwPyZtiyMac0OclDv5uBmw-vr3m_FAWeE'; // <--- NO OLVIDES PEGAR TU LLAVE AQUÍ

        fetch(`${SUPABASE_URL}/rest/v1/parejas?id_casete=eq.${idCasete}`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const pareja = data[0];
                
				// 1. NOMBRE DE LA PAREJA Y FOTO
                document.getElementById('titulo-pareja').innerText = pareja.nombre_pareja;
                
                // ESTO ES LO NUEVO: Reemplaza la imagen por la que está en la base de datos
                if (pareja.foto_url) {
                    document.getElementById('imagen-pareja').src = pareja.foto_url;
                }
				
				// --- NUEVO: APLICAR TEMA DINÁMICO ---
                console.log("Datos recibidos de Supabase:", pareja); // Para debuggear
                
                // Extraemos el tema. Ojo: lo pasamos a minúsculas por si lo escribiste con mayúscula inicial
                const temaSeleccionado = (pareja.tema || 'retro').toLowerCase().trim();
                console.log("Tema que se intentará aplicar:", temaSeleccionado);
                
                document.body.className = `tema-${temaSeleccionado}`;

                // 2. CALCULAR LOS DÍAS JUNTOS
                if (pareja.fecha_inicio) {
                    const fechaInicio = new Date(pareja.fecha_inicio);
                    const hoy = new Date();
                    const diasJuntos = Math.floor((hoy - fechaInicio) / (1000 * 60 * 60 * 24));
                    document.getElementById('contador-dias').innerText = `¡UN GRAN DIA JUNTOS! <3\nLLEVAMOS ${diasJuntos} DIAS.`;
                }

                // 3. REPRODUCTOR DE SPOTIFY
                if (pareja.id_spotify) {
                    const spotifyContainer = document.getElementById('spotify-container');
                    spotifyContainer.innerHTML = `
                        <iframe style="border-radius:8px" 
                        src="https://open.spotify.com/embed/track/${pareja.id_spotify}?utm_source=generator&theme=0" 
                        width="100%" height="152" frameBorder="0" allowfullscreen="" 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy">
                        </iframe>
                    `;
                }

                // 4. CONECTAR EL BOTÓN A NTFY
                const btnNotificacion = document.getElementById('btn-extrano'); 
                if (btnNotificacion && pareja.canal_ntfy) {
                    
                    // Extraemos el mensaje de Supabase. Si está vacío, usamos uno por defecto.
                    const mensajeSecreto = pareja.mensaje_notificacion || '¡Alguien presionó el botón y te extraña mucho! ❤️';
                    
                    btnNotificacion.addEventListener('click', () => {
                        enviarNotificacion(pareja.canal_ntfy, mensajeSecreto); // Pasamos el mensaje
                    });
                }
              
            } else {
                 document.getElementById('titulo-pareja').innerText = "CASETE NO ENCONTRADO";
                 document.getElementById('contador-dias').innerText = "Vuelve a intentar.";
                 document.getElementById('spotify-container').innerHTML = "";
            }
        })
        .catch(error => {
            console.error("Error:", error);
            document.getElementById('titulo-pareja').innerText = "ERROR DE CONEXION";
        });
    }
});

// Agregamos la palabra "mensaje" dentro del paréntesis
function enviarNotificacion(canal, mensaje) {
    const ntfyUrl = `https://ntfy.sh/${canal}`; 
    const btn = document.getElementById('btn-extrano');
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO...';
    btn.disabled = true;

    fetch(ntfyUrl, {
        method: 'POST',
        body: mensaje, // <--- Aquí usamos la variable en lugar del texto fijo
        headers: {
            'Title': 'Mensaje Especial',
            'Tags': 'love_letter,heart'
        }
    }).then(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> ¡ENVIADO!';
        btn.style.backgroundColor = '#8bc34a'; 
        
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-heart"></i> PRESIONA SI ME EXTRAÑAS <i class="fas fa-heart"></i>';
            btn.style.backgroundColor = '#d98aab';
            btn.disabled = false;
        }, 3000);
    }).catch(err => {
        btn.innerHTML = '<i class="fas fa-times"></i> ERROR';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-heart"></i> PRESIONA SI ME EXTRAÑAS <i class="fas fa-heart"></i>';
            btn.disabled = false;
        }, 3000);
    });
}
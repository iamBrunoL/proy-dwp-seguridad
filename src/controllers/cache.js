export const setNoCacheHeaders = (req, res, next) => {
    // Establecer las cabeceras para evitar el almacenamiento en caché en el navegador
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  
    // Continuar con el siguiente middleware
    next();
  };
  
    import jwt from 'jsonwebtoken';

    export const generateToken = (userId, res) => {
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
            expiresIn: '15d', // Token expires in 15 days
        });

        // Store the token in res.locals so it can be accessed by the controller (e.g., login)
        // This is useful if the frontend also wants to store the token in localStorage.
        res.locals.token = token; 

        res.cookie("jwt", token, {
            maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
            httpOnly: true, // Prevent XSS attacks (cookie cannot be accessed by client-side JS)
            sameSite: "strict", // CSRF protection
            secure: process.env.NODE_ENV !== "development", // Use secure cookies in production (HTTPS)
        });

        console.log("[generateToken] JWT cookie set. maxAge:", 15 * 24 * 60 * 60 * 1000, "httpOnly:", true, "sameSite:", "strict", "secure:", process.env.NODE_ENV !== "development"); // Debug log
    };

    
    
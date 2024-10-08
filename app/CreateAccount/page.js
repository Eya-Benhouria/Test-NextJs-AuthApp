"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from './CreateAccount.module.css';

// Fonction pour calculer la distance entre deux points géographiques
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance; // Distance en km
}

export default function CreateAccount() {
    const [name, setName] = useState('');
    const [prenom, setPrenom] = useState('');
    const [dateDeNaissance, setDateDeNaissance] = useState('');
    const [adresse, setAdresse] = useState('');
    const [email, setEmail] = useState('');
    const [numeroDeTelephone, setNumeroDeTelephone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const geocodeResponse = await axios.get(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}`);
            if (geocodeResponse.data.features.length === 0) {
                setError("Adresse introuvable.");
                return;
            }

            const coords = geocodeResponse.data.features[0].geometry.coordinates;
            const [lon, lat] = coords;

            // Coordonnées de Paris
            const parisLat = 48.8566;
            const parisLon = 2.3522;

            const distanceFromParis = calculateDistance(lat, lon, parisLat, parisLon);

            if (distanceFromParis > 50) {
                setError("L'adresse doit être située à moins de 50 km de Paris.");
                return;
            }
            const response = await axios.post('/api/users', {
                name,
                email,
                password,
                prenom,
                dateDeNaissance,
                adresse,
                numeroDeTelephone,
            });

            router.push('/'); // Rediriger vers la page d'accueil après l'inscription
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setError("Email déjà existant.");
            } else {
                console.log("Erreur lors de la création du compte utilisateur : ", error.response);
                setError("Une erreur est survenue.");
            }
        }
    }

    return (
        <div className={styles.createAccountContainer}>
            <div className={styles.wrapper}>
                <h2 className={styles.heading}>Create Account</h2>
                <hr className={styles.hrLine} />
                <p className={error === "" ? styles.hide : styles.show}>{error}</p>
                <form onSubmit={handleSubmit}>
                    <div className={styles.nameInputWrapper}>
                        <div>
                            <label htmlFor="name" className={styles.Label}>First Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className={styles.Input}
                            />
                        </div>
                        <div>
                            <label htmlFor="FamilyName" className={styles.Label}>Last Name</label>
                            <input
                                type="text"
                                id="FamilyName"
                                value={prenom}
                                onChange={(e) => setPrenom(e.target.value)}
                                required
                                className={styles.Input}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="dateDeNaissance" className={styles.Label}>Date of Birth</label>
                        <input
                            type="date"
                            id="dateDeNaissance"
                            value={dateDeNaissance}
                            onChange={(e) => setDateDeNaissance(e.target.value)}
                            required
                            className={styles.Input}
                        />
                    </div>
                    <div>
                        <label htmlFor="adresse" className={styles.Label}>Address</label>
                        <input
                            type="text"
                            id="adresse"
                            value={adresse}
                            onChange={(e) => setAdresse(e.target.value)}
                            required
                            className={styles.Input}
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className={styles.Label}>Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.Input}
                        />
                    </div>
                    <div className={styles.phoneInputContainer}>
                        <label htmlFor="countryCode" className={styles.Label}>Phone Number</label>
                        <div className={styles.phoneInputWrapper}>
                            <select
                                id="countryCode"
                                onChange={(e) => setNumeroDeTelephone(e.target.value + ' ' + numeroDeTelephone.split(' ')[1])}
                                className={`${styles.Input} ${styles.countryCodeInput}`}
                            >
                                <option value="+1">+1 (USA)</option>
                                <option value="+44">+44 (UK)</option>
                                <option value="+33">+33 (France)</option>
                                <option value="+49">+49 (Germany)</option>
                                <option value="+91">+91 (India)</option>
                                {/* Add more country codes as needed */}
                            </select>
                            <input
                                type="tel"
                                id="numeroDeTelephone"
                                value={numeroDeTelephone.split(' ')[1] || ''}
                                onChange={(e) => setNumeroDeTelephone(numeroDeTelephone.split(' ')[0] + ' ' + e.target.value)}
                                required
                                className={styles.Input}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className={styles.Label}>Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={styles.Input}
                        />
                    </div>
                    <button type="submit" className={styles.btn}>Create User</button>
                </form>
            </div>
        </div>
    );
}

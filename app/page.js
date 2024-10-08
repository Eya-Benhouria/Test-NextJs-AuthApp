"use client";

import axios from 'axios'; 
import { getSession, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from './page.module.css';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);

  const [userData, setUserData] = useState({
    name: session?.user.name || '',
    prenom: session?.user.prenom || '',
    dateDeNaissance: session?.user.dateDeNaissance || '',
    adresse: session?.user.adresse || '',
    numeroDeTelephone: session?.user.numeroDeTelephone || '',
  });

  useEffect(() => {
    if (session) {
      console.log("Session data:", session);
      setUserData({
        name: session.user.name,
        prenom: session.user.prenom,
        dateDeNaissance: session.user.dateDeNaissance,
        adresse: session.user.adresse,
        numeroDeTelephone: session.user.numeroDeTelephone,
      });
    }
  }, [session]);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = () => {
    signOut();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsEditing(false); 
  };

  const handleSaveAndLogout = async () => {
    const session = await getSession();
    if (!session || !session.user.id) {
      console.error('No session or user ID found');
      return;
    }

    try {
      const response = await axios.put('/api/updateUser', {
        id: session.user.id,
        name: userData.name,
        prenom: userData.prenom,
        dateDeNaissance: userData.dateDeNaissance ? new Date(userData.dateDeNaissance).toISOString() : null,
        adresse: userData.adresse,
        numeroDeTelephone: userData.numeroDeTelephone,
      });

      console.log('Server response:', response.data);
      signOut();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  return (
    <div className={styles.homeContainer}>
      <div className={styles.wrapper}>
        {status !== "authenticated" ? (
          <>
            <h2 className={styles.heading}>Welcome to our website</h2>
            <hr className={styles.hrLine} />
            <p className={styles.paragraph}>Please sign in or create an account to continue.</p>
            <button className={styles.btn} onClick={handleLogin}>Sign In / Sign Up</button>
          </>
        ) : (
          <>
            <h2 className={styles.heading}>Welcome, {session.user.name}</h2>
            <hr className={styles.hrLine} />
            <form onSubmit={handleSubmit}>
              <p className={styles.paragraph}>First Name:</p>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  className={styles.input}
                />
              ) : (
                <span>{userData.name}</span>
              )}
              <p className={styles.paragraph}>Last Name:</p>
              {isEditing ? (
                <input
                  type="text"
                  name="prenom"
                  value={userData.prenom}
                  onChange={handleChange}
                  className={styles.input}
                />
              ) : (
                <span>{userData.prenom}</span>
              )}
              <p className={styles.paragraph}>Date Of Birth:</p>
              {isEditing ? (
                <input
                  type="date"
                  name="dateDeNaissance"
                  value={userData.dateDeNaissance}
                  onChange={handleChange}
                  className={styles.input}
                />
              ) : (
                <span>{userData.dateDeNaissance}</span>
              )}
              <p className={styles.paragraph}>Adresse:</p>
              {isEditing ? (
                <input
                  type="text"
                  name="adresse"
                  value={userData.adresse}
                  onChange={handleChange}
                  className={styles.input}
                />
              ) : (
                <span>{userData.adresse}</span>
              )}
              <p className={styles.paragraph}>Phone Number:</p>
              {isEditing ? (
                <input
                  type="text"
                  name="numeroDeTelephone"
                  value={userData.numeroDeTelephone}
                  onChange={handleChange}
                  className={styles.input}
                />
              ) : (
                <span>{userData.numeroDeTelephone}</span>
              )}
              
              {isEditing ? (
                <>
                  <button type="submit" className={styles.btn}>Update</button>
                  <button type="button" className={styles.btn} onClick={() => setIsEditing(false)}>Cancel</button>
                </>
              ) : (
                <button type="button" className={styles.btn} onClick={() => setIsEditing(true)}>Edit Profile</button>
              )}
            </form>
            <button className={styles.btn} onClick={handleSaveAndLogout}>Save & Sign out</button>
          </>
        )}
      </div>
    </div>
  );
}
const {
    addDoc,
    collection,
    query,
    where,
    getDocs,
    setDoc,
    doc,
} = require("firebase/firestore");

exports.addUserTokenRecord = async(db, teamInfo) => {
    const users = await this.findUsersById(
        db,
        teamInfo.authed_user.id,
        teamInfo.team.id
    );

    if (users.docs.length > 0) {
        return setDoc(doc(db, "teamInfo", users.docs[0].id), teamInfo);
    } else {
        return addDoc(collection(db, "teamInfo"), teamInfo);
    }
};

exports.findUsersById = (db, userId, teamId) => {
    const q = query(
        collection(db, "teamInfo"),
        where("authed_user.id", "==", userId),
        where("team.id", "==", teamId)
    );
    return getDocs(q);
};
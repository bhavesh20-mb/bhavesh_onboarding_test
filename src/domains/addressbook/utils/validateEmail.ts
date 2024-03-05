export const validateEmail = (email :string) => {
    if(email){
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }else{
        return true
    }

};
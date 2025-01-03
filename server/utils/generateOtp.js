const generatOtp = () => {
  return Math.floor(100000 + Math.random() * 900000); //six digit otp  ie from 100000 to 999999
};

export default generatOtp;

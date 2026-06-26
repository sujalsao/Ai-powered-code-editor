// Sign In Page
import React from "react";
import SignInFormClient from "../../../../../modules/auth/components/sign-in-form-client";

const Page = () => {
    return (
        <>
            <img src="/login.svg" alt='login-image' height={300} width={300} className='m-6 object-cover' />
            <SignInFormClient/>
        </>
    );
};

export default Page;
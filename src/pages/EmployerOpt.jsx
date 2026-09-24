import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import MemberCard from '../components/MemberCard';
import { toast } from 'react-toastify';
import Loader from '../components/ui/Loader';
import axiosInstance from '../utils/axiosInstance';
import { updateUser } from '../features/auth/authSlice';
import { getAccessToken } from '../utils/tokenManager';

const EmployerOpt = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const emailFromQuery = queryParams.get('email')?.trim() || '';
    const roleFromQuery = queryParams.get('role')?.trim() || '';
    const { email, firstName, lastName, password, role } = location.state || {};
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const resolvedEmail = emailFromQuery || email || storedUser?.email || '';
    const resolvedFirstName = firstName || storedUser?.firstName || '';
    const resolvedLastName = lastName || storedUser?.lastName || '';
    const resolvedRole = roleFromQuery || role || storedUser?.role || 'recruiter';

    const [showIndividualInfo, setShowIndividualInfo] = useState(false);
    const [showCoperateInfo, setShowCoperateInfo] = useState(false);

    const [show, setShow] = useState(false);

    const individualRef = useRef(null);
    const coperateRef = useRef(null);

    const handleClick = async (mode) => {
        console.log('[EmployerOpt] Selection clicked:', { mode });
        console.log('[EmployerOpt] Current resolved values before validation:', {
            resolvedEmail,
            resolvedFirstName,
            resolvedLastName,
            resolvedRole,
        });

        if (!resolvedEmail) {
            console.warn('[EmployerOpt] Missing resolvedEmail, cannot continue', {
                routeState: location.state,
                storedUser,
            });
            toast.error('Missing account email. Please sign in and try again.');
            return;
        }

        const payload = {
            role: resolvedRole,
            mode,
            followings: [],
        };

        // Keep compatibility for non-OAuth flows that still send these fields.
        if (resolvedFirstName) payload.firstName = resolvedFirstName;
        if (resolvedLastName) payload.lastName = resolvedLastName;
        if (password) payload.password = password;
        
        try {
            setShow(true);
            if (!getAccessToken()) {
                toast.error('Session expired. Please verify your email or sign in again.');
                setShow(false);
                return;
            }
            console.log('[EmployerOpt] Sending complete-signup payload:', payload);
            const response = await axiosInstance.post('/auth/complete-signup', payload, {
                headers: { 'Content-Type': 'application/json' },
            });
            console.log('[EmployerOpt] Complete-signup API success');
            console.log('[EmployerOpt] Complete-signup API response:', response?.data);

            const responseData = response?.data || {};
            const responseUser =
                responseData?.user ||
                responseData?.confirmedUser ||
                responseData?.data?.user ||
                null;
            const responseAccessToken =
                responseData?.accessToken ||
                responseData?.token ||
                responseData?.data?.accessToken ||
                null;
            const responseRefreshToken =
                responseData?.refreshToken ||
                responseData?.data?.refreshToken ||
                null;

            if (responseAccessToken) {
                localStorage.setItem('accessToken', responseAccessToken);
                localStorage.setItem('authToken', responseAccessToken);
                console.log('[EmployerOpt] Stored access token from complete-signup response');
            }
            if (responseRefreshToken) {
                localStorage.setItem('refreshToken', responseRefreshToken);
                console.log('[EmployerOpt] Stored refresh token from complete-signup response');
            }

            // Keep local user context for subsequent profile setup steps.
            const normalizedUser = responseUser
                ? {
                    ...storedUser,
                    ...responseUser,
                    id: responseUser?.id || responseUser?.userId || responseUser?.sub || storedUser?.id || null,
                    email: responseUser?.email || resolvedEmail,
                    firstName: responseUser?.firstName || resolvedFirstName || storedUser?.firstName || '',
                    lastName: responseUser?.lastName || resolvedLastName || storedUser?.lastName || '',
                    role: responseUser?.role || resolvedRole,
                    mode: responseUser?.mode || mode,
                }
                : {
                    ...storedUser,
                    email: storedUser?.email || resolvedEmail,
                    firstName: storedUser?.firstName || resolvedFirstName || '',
                    lastName: storedUser?.lastName || resolvedLastName || '',
                    role: storedUser?.role || resolvedRole,
                    mode,
                };

            localStorage.setItem('user', JSON.stringify(normalizedUser));
            console.log('[EmployerOpt] Stored normalized user after complete-signup:', normalizedUser);

            dispatch(updateUser(normalizedUser));

            toast.success('Registration successful');

            const navState = {
                email: normalizedUser.email || resolvedEmail,
                firstName:
                    normalizedUser.firstName !== undefined && normalizedUser.firstName !== null
                        ? normalizedUser.firstName
                        : resolvedFirstName,
                lastName:
                    normalizedUser.lastName !== undefined && normalizedUser.lastName !== null
                        ? normalizedUser.lastName
                        : resolvedLastName,
            };

            if (mode === 'individual') {
                console.log('[EmployerOpt] Navigating to individual basic-details with state:', navState);
                navigate('/individual/basic-details', {
                    state: navState,
                });
            
            } else if (mode === 'corporate') {
                console.log('[EmployerOpt] Navigating to corporate basic-details with state:', navState);
                navigate('/corporate/basic-details', {
                    state: navState,
                });
            }

        } catch (error) {
            console.error("Complete signup error:", error);
            const errorText = error?.response?.data?.error || "Signup failed";
            toast.error(errorText);
        } finally {
            setShow(false);
        }

       
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                individualRef.current &&
                !individualRef.current.contains(e.target)
            )
                setShowIndividualInfo(false);
            if (coperateRef.current && !coperateRef.current.contains(e.target))
                setShowCoperateInfo(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <div className="w-full px-4 py-6 flex items-center max-w-screen-xl mx-auto shrink-0">
                <img
                    src="/assets/images/logo.png"
                    alt="logo"
                    className="h-10"
                />
            </div>

            <div className="flex flex-1 flex-col items-center justify-center w-full px-4 py-10 relative z-10">
                <h1 className="lg:text-5xl text-2xl text-[#16730F] font-[500] leading-relaxed font-norican">
                    As an Employer
                </h1>
                <p className="lg:text-xl text-center text-[#333] font-[400] leading-relaxed">
                    Choose the account type that fits your hiring needs
                </p>

                <div className="lg:w-[50%] w-full px-4 mt-8 sm:mt-12 flex flex-wrap justify-center gap-6 py-10 bg-[#E0E0E01A] rounded-2xl border border-[#82828226]">
                    <MemberCard
                        label="Individual"
                        iconSrc="/assets/images/user.svg"
                        infoText="Individual employers are people whose businesses are not registered with the federal, state, or local governments. 
                      They are micro, small, and medium scale enterprises (SMEs). They also include people who are HR consultants (they recruit for other companies); 
                      individuals who require the services of other people on the platform."
            position="above-icon"
            showInfo={showIndividualInfo}
            setShowInfo={setShowIndividualInfo}
            containerRef={individualRef}
            // onClick={() => navigate("/individual/basic-details")}
            onClick={() => handleClick("individual")}
          />

          <MemberCard
            label="Corporate "
            iconSrc="/assets/images/freelic2.svg"
            infoText="These are businesses, NGOs, religious bodies, or government organizations that are registered 
            with the federal, state, or local government of their country. They may be SMEs or larger corporate
             organizations, NGOs, and government bodies (Federal, state, or local governments). The representative
              on Bejite must be verified to ensure they are genuine."
                        position="below-card"
                        showInfo={showCoperateInfo}
                        setShowInfo={setShowCoperateInfo}
                        containerRef={coperateRef}
                        // onClick={() => navigate("/coperate/Basic-details")}
                        onClick={() => handleClick('corporate')}
                    />
                </div>
            </div>
            <Loader show={show} />
        </div>
    );
};

export default EmployerOpt;

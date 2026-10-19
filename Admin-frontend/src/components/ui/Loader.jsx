import Bej from '../../assets/logo/bej 1.png';
import Eclipse27 from '../../assets/logo/Ellipse 27.png';
import Eclipse271 from '../../assets/logo/Ellipse 27-1.png';
const Loader = ({ show, spin = true, description }) => {
    return (
        <>
            {show && (
                <div className="w-screen h-screen fixed left-0 top-0 bg-white/70 flex justify-center items-center z-30 backdrop-blur-sm flex-col gap-5">
                    <div
                        className="relative z-20 flex justify-center items-center"
                        style={{ width: 100, height: 100 }}
                    >
                        <img
                            src={Bej}
                            alt="bej"
                            className="absolute z-10"
                            style={{ width: 80, height: 80 }}
                        />
                        <img
                            src={Eclipse27}
                            alt="eclipse 27"
                            className="absolute"
                            style={{ width: 80, height: 80 }}
                        />
                        {spin && (
                            <img
                                src={Eclipse271}
                                alt="eclipse271"
                                className="absolute z-20 animate-spin"
                                style={{ width: 80, height: 80 }}
                            />
                        )}
                    </div>
                    {description && (
                        <p className="text-center text-[#1A3E32] text-md">
                            {description}
                        </p>
                    )}
                </div>
            )}
        </>
    );
};

export default Loader;

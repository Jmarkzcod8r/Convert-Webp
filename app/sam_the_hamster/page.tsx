import Loader from "../components/sam";
import FireworkCanvas from "../components/fireworks";

const Sam = () => {
    return (
        <div className="relative flex items-center justify-center p-5 h-screen overflow-hidden">
            {/* Fireworks in the background */}
            {/* <FireworkCanvas /> */}
            
            {/* Loader in the center */}
            <div className="absolute z-10">
                <Loader w="25em" h="25em" />
            </div>
        </div>
    );
};

export default Sam;

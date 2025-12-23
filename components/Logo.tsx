import Image from "next/image";
import Link from "next/link";

const Logo = () => (
    <div className="flex-shrink-0">
        <Link href="/" passHref className="hidden md:block">
            <Image
                src="/final_blue_text_500by500.svg"
                alt="Logo"
                width={90}
                height={90}
                className="filter hover:cursor-pointer w-[50px] h-[50px] xs:w-[60px] xs:h-[60px] sm:w-[70px] sm:h-[70px] md:w-[80px] md:h-[80px] lg:w-[90px] lg:h-[90px] dark:invert dark:brightness-0 dark:contrast-100 "
                priority
            />
        </Link>
        <Link href="/" passHref className="block md:hidden">
            <Image
                src="/final_blue_logo_500by500.svg"
                alt="Logo"
                width={32}
                height={32}
                className="filter hover:cursor-pointer dark:invert dark:brightness-0 dark:contrast-100"
                priority
            />
        </Link>
    </div>
);

export default Logo;

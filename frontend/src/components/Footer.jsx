function Company() {
    return (
        <div className="content-stretch flex items-center relative shrink-0 w-[100px]" data-name="Company">
            <div className="flex flex-[1_0_0] flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] min-h-px min-w-px not-italic relative text-[24px] text-black text-center tracking-[-0.48px]">
                <p className="leading-[1.45]">3D HUB</p>
            </div>
        </div>
    );
}

function Text() {
    return (
        <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Text">
            <Company />
            <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.55)] tracking-[-0.08px] w-[min-content]">
                <p className="leading-[1.45]">Descriptive line about what your company does.</p>
            </div>
        </div>
    );
}

function SocialLink() {
    return (
        <button className="block relative shrink-0 size-[24px]" data-name="Social link 1">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                <defs>
                    <clipPath id="clip0_37_59">
                        <rect fill="white" height="24" width="24" />
                    </clipPath>
                </defs>
            </svg>
        </button>
    );
}

function SocialLink1() {
    return (
        <button className="block relative shrink-0 size-[24px]" data-name="Social link 2">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                <defs>
                    <clipPath id="clip0_37_53">
                        <rect fill="white" height="24" width="24" />
                    </clipPath>
                </defs>
            </svg>
        </button>
    );
}

function SocialLink2() {
    return (
        <button className="block relative shrink-0 size-[24px]" data-name="Social link 3">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            </svg>
        </button>
    );
}

function SocialLinks() {
    return (
        <nav className="content-stretch cursor-pointer flex gap-[24px] items-center relative shrink-0" data-name="Social links">
            <SocialLink />
            <SocialLink1 />
            <SocialLink2 />
        </nav>
    );
}

function Content() {
    return (
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[56px] items-start min-h-px min-w-px relative" data-name="Content">
            <Text />
            <SocialLinks />
        </div>
    );
}

function Header() {
    return (
        <div className="content-stretch flex items-start pb-[16px] relative shrink-0 w-full" data-name="Header">
            <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-black tracking-[-0.08px] whitespace-nowrap">
                <p className="leading-[1.45]">Ferramentas</p>
            </div>
        </div>
    );
}

function Column() {
    return (
        <nav className="content-stretch flex flex-col gap-[8px] items-start justify-center relative shrink-0 w-[130px]" data-name="Column 1">
            <Header />
            <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.55)] tracking-[-0.08px] w-full">
                <p className="leading-[1.45]">Integrações</p>
            </div>
        </nav>
    );
}

function Header1() {
    return (
        <div className="content-stretch flex items-start pb-[16px] relative shrink-0 w-full" data-name="Header">
            <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-black tracking-[-0.08px] whitespace-nowrap">
                <p className="leading-[1.45]">Saiba Mais</p>
            </div>
        </div>
    );
}

function Column1() {
    return (
        <nav className="content-stretch flex flex-col gap-[8px] items-start justify-center relative shrink-0 w-[130px]" data-name="Column 2">
            <Header1 />
            <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.55)] tracking-[-0.08px] w-full">
                <p className="leading-[1.45]">Casos de Estudos</p>
            </div>
        </nav>
    );
}

function Header2() {
    return (
        <div className="content-stretch flex items-start pb-[16px] relative shrink-0 w-full" data-name="Header">
            <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-black tracking-[-0.08px] whitespace-nowrap">
                <p className="leading-[1.45]">Suporte</p>
            </div>
        </div>
    );
}

function Column2() {
    return (
        <nav className="content-stretch flex flex-col gap-[8px] items-start justify-center relative shrink-0 w-[130px]" data-name="Column 3">
            <Header2 />
            <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.55)] tracking-[-0.08px] w-full">
                <p className="leading-[1.45]">Contato</p>
            </div>
            <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.55)] tracking-[-0.08px] w-full">
                <p className="leading-[1.45]">Suporte</p>
            </div>
            <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-[rgba(0,0,0,0.55)] tracking-[-0.08px] w-full">
                <p className="leading-[1.45]">Legal</p>
            </div>
        </nav>
    );
}

function Nav() {
    return (
        <div className="content-stretch flex gap-[40px] items-start relative shrink-0" data-name="Nav">
            <Column />
            <Column1 />
            <Column2 />
        </div>
    );
}

function Container() {
    return (
        <div className="content-stretch flex flex-[1_0_0] gap-[120px] items-start min-h-px min-w-px py-[80px] relative" data-name="Container">
            <div aria-hidden="true" className="absolute border-[rgba(0,0,0,0.1)] border-solid border-t inset-0 pointer-events-none" />
            <Content />
            <Nav />
        </div>
    );
}

export default function Footer() {
    return (
        <footer className="content-stretch flex items-center justify-center pb-[120px] px-[64px] relative size-full" data-name="Footer 1">
            <Container />
        </footer>
    );
}
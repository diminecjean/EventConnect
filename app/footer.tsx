import { ModeToggle } from "@/components/ui/mode-toggle";
import { Footer, FooterBottom } from "@/components/ui/footer";

export default function FooterSection() {
  return (
    <footer className="w-full bg-background bg-opacity-70 mt-12">
      <div className="mx-auto max-w-container ">
        <Footer className="pt-0">
          <FooterBottom className="px-8 flex flex-col justify-center items-center gap-4 sm:flex-col md:flex-row">
            <div>© 2025 EventConnect. All rights reserved</div>
            <div className="flex items-center gap-4">
              {/* <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a> */}
              {/* <ModeToggle /> */}
            </div>
          </FooterBottom>
        </Footer>
      </div>
    </footer>
  );
}

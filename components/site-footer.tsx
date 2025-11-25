export function SiteFooter() {
  return (
    <footer className="border-t bg-zinc-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-zinc-900">About</h3>
            <p className="text-sm text-zinc-600">
              Twenny is your destination for discovering and purchasing tickets to amazing events.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-zinc-900">Quick Links</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="/events" className="text-zinc-600 hover:text-zinc-900">
                  Browse Events
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-600 hover:text-zinc-900">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-600 hover:text-zinc-900">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-zinc-900">Legal</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="#" className="text-zinc-600 hover:text-zinc-900">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-600 hover:text-zinc-900">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-zinc-600">
          © {new Date().getFullYear()} Twenny. All rights reserved.
        </div>
      </div>
    </footer>
  );
}


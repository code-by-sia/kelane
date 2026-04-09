import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function Welcome({ onNext }) {
  const [isAccepted, setIsAccepted] = useState(false);
  const formattedDate = useMemo(() => new Date().toLocaleString(), []);

  return (
    <div className="flex flex-col justify-center h-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold my-3">Welcome to Jimêryar</h1>

      <div className="bg-white border p-6 w-full h-96 overflow-auto font-mono rounded">
        <h1 class="text-3xl font-bold mb-2">Terms of Use & Conditions</h1>
        <p class="text-sm text-gray-500 mb-8">
          Effective Date: <span class="italic">{formattedDate}</span>
        </p>
        <p class="mb-6">
          These Terms of Use and Conditions (“Terms”) govern your access to and
          use of
          <span class="font-semibold"> Jimêryar </span> (“Software”, “Service”,
          “we”, “our”, or “us”). By accessing or using the Software, you agree
          to be bound by these Terms.
        </p>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-3">
            1. Description of the Service
          </h2>
          <p class="mb-3">
            Jimêryar is an accounting software application that allows users to
            record, manage, and organize financial data.
          </p>
          <ul class="list-disc pl-6 space-y-2">
            <li>
              <strong>Free Version:</strong> Data is stored locally in the
              user’s browser or device.
            </li>
            <li>
              <strong>Paid Version:</strong> Data is stored securely on our
              servers and may include additional features.
            </li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-3">2. Eligibility</h2>
          <p>
            You must be at least 18 years old or the age of legal majority in
            your jurisdiction to use the Software.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-3">3. User Accounts</h2>
          <ul class="list-disc pl-6 space-y-2">
            <li>
              You are responsible for maintaining the confidentiality of your
              login credentials
            </li>
            <li>All activity occurring under your account</li>
            <li>Providing accurate and current information</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-3">
            4. Data Storage and Responsibility
          </h2>

          <div class="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 class="font-semibold mb-2">Free Version (Local Storage)</h3>
            <ul class="list-disc pl-6 space-y-1">
              <li>Data is stored locally in your browser or device</li>
              <li>We do not have access to this data</li>
              <li>Clearing browser data may result in permanent loss</li>
              <li>You are responsible for backups</li>
            </ul>
          </div>

          <div class="bg-gray-100 p-4 rounded-lg">
            <h3 class="font-semibold mb-2">Paid Version (Server Storage)</h3>
            <ul class="list-disc pl-6 space-y-1">
              <li>Data is stored on our servers</li>
              <li>Security measures are used but not guaranteed</li>
              <li>You remain the owner of your data</li>
            </ul>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-3">5. Accounting Disclaimer</h2>
          <p>
            The Software is provided as a tool only and does not constitute
            accounting, tax, financial, or legal advice. You are solely
            responsible for compliance, verification, and legal obligations.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-3">
            6. Payments and Subscriptions
          </h2>
          <ul class="list-disc pl-6 space-y-1">
            <li>Paid features require payment</li>
            <li>Fees are non-refundable unless required by law</li>
            <li>Pricing and features may change with notice</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-3">7. Acceptable Use</h2>
          <ul class="list-disc pl-6 space-y-1">
            <li>No unlawful use</li>
            <li>No hacking or system interference</li>
            <li>No reverse engineering</li>
            <li>No malicious content</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-3">8. Intellectual Property</h2>
          <p>
            All rights to the Software remain the exclusive property of
            <span class="font-semibold">[Company Name]</span>. You receive a
            limited license to use the Software.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-3">9. Service Availability</h2>
          <p>
            We may modify, suspend, or discontinue the Software at any time
            without liability.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-3">10. Termination</h2>
          <p>
            We may suspend or terminate access for violations of these Terms.
            Server-stored data may be deleted after termination.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-3">
            11. Limitation of Liability
          </h2>
          <p class="italic">
            The Software is provided “as is” without warranties. We are not
            liable for data loss, financial loss, or indirect damages.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-3">12. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless [Company Name] from claims
            arising from your use of the Software.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-3">13. Privacy</h2>
          <p>Your use of the Software is governed by our Privacy Policy.</p>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold mb-3">14. Governing Law</h2>
          <p>
            These Terms are governed by the laws of{" "}
            <span class="font-semibold">[Your Country / State]</span>.
          </p>
        </section>

        <section class="mb-10">
          <h2 class="text-xl font-semibold mb-3">15. Contact Information</h2>
          <div class="bg-gray-100 p-4 rounded-lg">
            <p>
              <strong>Email:</strong> support@email.com
            </p>
            <p>
              <strong>Company:</strong> [Company Name]
            </p>
          </div>
        </section>
      </div>

      <div className="flex justify-between">
        <div className="mt-4 flex gap-2 items-center">
          <Checkbox
            id="terms"
            checked={isAccepted}
            onCheckedChange={setIsAccepted}
          />
          <label htmlFor="terms">I agree to the terms and conditions</label>
        </div>
        <Button
          disabled={!isAccepted}
          className="btn btn-primary mt-4"
          onClick={() => onNext(1)}
        >
          Accept Terms and Conditions
        </Button>
      </div>
    </div>
  );
}

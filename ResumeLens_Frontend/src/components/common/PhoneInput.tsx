import PhoneInputModule from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const PhoneInputLib =
  (PhoneInputModule as any).default ??
  PhoneInputModule;

type PhoneInputProps = {
  countryCode: string;
  phone: string;
  disabled?: boolean;
  onCountryCodeChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
};

export default function PhoneInput({
  countryCode,
  phone,
  disabled = false,
  onCountryCodeChange,
  onPhoneChange,
}: PhoneInputProps) {
  const value = `${countryCode || "+91"}${phone || ""}`;

  function handleChange(
    inputValue: string,
    country: {
      dialCode?: string;
    }
  ) {
    const dialCode = country?.dialCode
      ? `+${country.dialCode}`
      : "+91";

    const allDigits = inputValue.replace(/\D/g, "");
    const dialDigits = dialCode.replace(/\D/g, "");

    let phoneDigits = allDigits;

    if (phoneDigits.startsWith(dialDigits)) {
      phoneDigits = phoneDigits.slice(dialDigits.length);
    }

    // Maximum 10 digits for the phone number.
    phoneDigits = phoneDigits.slice(0, 10);

    onCountryCodeChange(dialCode);
    onPhoneChange(phoneDigits);
  }

  return (
    <div className="phone-input-wrapper">
      <PhoneInputLib
        country="in"
        value={value}
        onChange={handleChange}
        enableSearch
        searchPlaceholder="Search country..."
        searchNotFound="Country not found"
        preferredCountries={[
          "in",
          "us",
          "gb",
          "ae",
          "ca",
          "au",
        ]}
        countryCodeEditable={false}
        disabled={disabled}
        disableSearchIcon={false}
        inputProps={{
          required: true,
          inputMode: "numeric",
          autoComplete: "tel",
        }}
        inputClass="!h-10 !w-full !rounded-xl !border !border-input !bg-background/60 !text-sm !text-foreground"
        buttonClass="!rounded-l-xl !border-input !bg-background/60 hover:!bg-accent"
        dropdownClass="!z-[100] !rounded-xl !border !border-border !bg-surface !shadow-lift"
        searchClass="!mx-2 !my-2 !w-[calc(100%-16px)] !rounded-lg !border !border-input !bg-background !px-3 !py-2 !text-sm"
      />

      <style>{`
        .phone-input-wrapper .form-control {
          color: hsl(var(--foreground));
          background: hsl(var(--background) / 0.6);
        }

        .phone-input-wrapper .country-list {
          color: hsl(var(--foreground));
          background: hsl(var(--surface));
        }

        .phone-input-wrapper .country-list .country:hover,
        .phone-input-wrapper .country-list .country.highlight {
          background: hsl(var(--accent));
        }

        .phone-input-wrapper .search-box {
          color: hsl(var(--foreground));
          background: hsl(var(--background));
        }
      `}</style>
    </div>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  CalendarDays,
  Pencil,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { inputClass } from "@/components/auth/auth-shell";
import PhoneInput from "@/components/common/PhoneInput";


/* ============================================================
   ROUTE
============================================================ */

export const Route = createFileRoute(
  "/dashboard/profile"
)({
  head: () => ({
    meta: [
      {
        title: "Profile — ResumeLens",
      },
      {
        name: "description",
        content:
          "Manage your ResumeLens profile: name, contact details, role and experience.",
      },
      {
        property: "og:title",
        content: "Profile — ResumeLens",
      },
      {
        property: "og:description",
        content:
          "Keep your ResumeLens profile and role targeting current.",
      },
    ],
  }),

  component: ProfilePage,
});


/* ============================================================
   DARK-MODE SAFE INPUT CLASS
============================================================ */

/*
  We intentionally do not rely only on inputClass here.

  The Profile page has read-only fields, and browser/theme
  styles can make those fields appear washed out in dark mode.

  These classes explicitly define:
  - background
  - text
  - border
  - placeholder
  - focus state
  - dark-mode appearance
*/

const profileInputClass = `
  h-11
  w-full
  rounded-xl
  border
  border-border
  bg-background
  px-3.5
  text-sm
  text-foreground
  outline-none
  transition-all
  placeholder:text-muted-foreground
  focus:border-primary
  focus:ring-2
  focus:ring-primary/15
  dark:bg-slate-950
  dark:text-white
  dark:border-slate-700
  dark:placeholder:text-slate-500
  dark:focus:border-primary
`;


/* ============================================================
   ROW
============================================================ */

function Row({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        grid
        gap-5
        px-5
        py-6
        sm:grid-cols-[220px_minmax(0,1fr)]
        sm:px-6
      "
    >

      {/* LEFT */}

      <div className="flex gap-3">

        <div
          className="
            mt-0.5
            grid
            size-8
            shrink-0
            place-items-center
            rounded-lg
            bg-primary/10
            text-primary
          "
        >
          {icon}
        </div>


        <div>

          <h3
            className="
              text-[13.5px]
              font-medium
              text-foreground
            "
          >
            {title}
          </h3>


          <p
            className="
              mt-1
              text-[12px]
              leading-5
              text-muted-foreground
            "
          >
            {description}
          </p>

        </div>

      </div>


      {/* RIGHT */}

      <div className="min-w-0">
        {children}
      </div>

    </div>
  );
}


/* ============================================================
   PROFILE TYPE
============================================================ */

type Profile = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_code: string;
  role: string;
  other_role: string;
  experience: string;
  created_at: string;
};


/* ============================================================
   PAGE
============================================================ */

function ProfilePage() {

  /* ==========================================================
     STATE
  ========================================================== */

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [originalProfile, setOriginalProfile] =
    useState<Profile | null>(null);

  const [countryCode, setCountryCode] =
    useState("+91");

  const [loading, setLoading] =
    useState(true);

  const [isEditing, setIsEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);


  /* ==========================================================
     LOAD PROFILE
  ========================================================== */

  useEffect(() => {

    async function loadProfile() {

      try {

        const userId =
          localStorage.getItem("user_id");


        if (!userId) {

          toast.error(
            "Please login again."
          );

          return;
        }


        const response =
          await axios.get(
            `http://127.0.0.1:8000/profile/${userId}`
          );


        const loadedProfile: Profile = {
          ...response.data,

          other_role:
            response.data.other_role || "",

          country_code:
            response.data.country_code || "+91",

          experience:
            response.data.experience || "0",
        };


        setProfile(
          loadedProfile
        );

        setOriginalProfile(
          loadedProfile
        );


        setCountryCode(
          response.data.country_code || "+91"
        );

      } catch (error) {

        console.error(
          "Failed to load profile:",
          error
        );


        toast.error(
          "Failed to load profile."
        );

      } finally {

        setLoading(false);

      }

    }


    loadProfile();

  }, []);


  /* ==========================================================
     UPDATE FIELD
  ========================================================== */

  function updateField(
    field: keyof Profile,
    value: string
  ) {

    if (!isEditing) {
      return;
    }


    setProfile((current) => {

      if (!current) {
        return current;
      }


      return {
        ...current,
        [field]: value,
      };

    });

  }


  /* ==========================================================
     EDIT
  ========================================================== */

  function startEditing() {

    if (!profile) {
      return;
    }


    setOriginalProfile({
      ...profile,
    });


    setIsEditing(true);

  }


  /* ==========================================================
     CANCEL
  ========================================================== */

  function cancelEditing() {

    if (originalProfile) {

      setProfile({
        ...originalProfile,
      });


      setCountryCode(
        originalProfile.country_code || "+91"
      );

    }


    setIsEditing(false);

  }


  /* ==========================================================
     SAVE
  ========================================================== */

  async function saveProfile() {

    if (!profile) {
      return;
    }


    /* --------------------------------------------------------
       EMAIL
    -------------------------------------------------------- */

    const normalizedEmail =
      profile.email
        .trim()
        .toLowerCase();


    if (
      !/^[a-z0-9._%+-]+@gmail\.com$/.test(
        normalizedEmail
      )
    ) {

      toast.error(
        "Please enter a valid Gmail address."
      );

      return;
    }


    /* --------------------------------------------------------
       PHONE
    -------------------------------------------------------- */

    if (
      !/^\d{10}$/.test(
        profile.phone
      )
    ) {

      toast.error(
        "Phone number must contain exactly 10 digits."
      );

      return;
    }


    /* --------------------------------------------------------
       OTHER ROLE
    -------------------------------------------------------- */

    if (
      profile.role === "other" &&
      !profile.other_role.trim()
    ) {

      toast.error(
        "Please enter your role type."
      );

      return;
    }


    /* --------------------------------------------------------
       EXPERIENCED
    -------------------------------------------------------- */

    if (
      profile.role === "experienced" &&
      !String(
        profile.experience
      ).trim()
    ) {

      toast.error(
        "Years of experience is required."
      );

      return;
    }


    try {

      setSaving(true);


      const userId =
        localStorage.getItem(
          "user_id"
        );


      if (!userId) {

        toast.error(
          "Please login again."
        );

        return;
      }


      const response =
        await axios.put(
          `http://127.0.0.1:8000/profile/${userId}`,
          {
            first_name:
              profile.first_name.trim(),

            last_name:
              profile.last_name.trim(),

            email:
              normalizedEmail,

            phone:
              profile.phone,

            country_code:
              countryCode,

            role:
              profile.role,

            other_role:
              profile.role === "other"
                ? profile.other_role.trim()
                : "",

            experience:
              profile.role === "experienced" ||
              profile.role === "other"
                ? profile.experience || "0"
                : "0",
          }
        );


      const updatedUser =
        response.data.user;


      const updatedProfile: Profile = {
        ...profile,

        ...updatedUser,

        email:
          updatedUser.email ||
          normalizedEmail,

        country_code:
          updatedUser.country_code ||
          countryCode,

        other_role:
          updatedUser.other_role ||
          "",

        experience:
          updatedUser.experience ||
          "0",
      };


      setProfile(
        updatedProfile
      );


      setOriginalProfile(
        updatedProfile
      );


      setCountryCode(
        updatedProfile.country_code
      );


      setIsEditing(false);


      /* ------------------------------------------------------
         LOCAL STORAGE
      ------------------------------------------------------ */

      const storedUser =
        localStorage.getItem(
          "user"
        );


      if (storedUser) {

        try {

          const parsedUser =
            JSON.parse(
              storedUser
            );


          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsedUser,
              ...updatedUser,
            })
          );

        } catch {
          // Ignore invalid localStorage data.
        }

      }


      toast.success(
        "Profile saved successfully."
      );

    } catch (error: any) {

      console.error(
        "Failed to save profile:",
        error
      );


      const message =
        error?.response?.data?.detail ||
        "Failed to save profile.";


      toast.error(
        message
      );

    } finally {

      setSaving(false);

    }

  }


  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {

    return (

      <div
        className="
          mx-auto
          w-full
          max-w-5xl
          px-5
          py-10
          sm:px-8
        "
      >

        <div
          className="
            rounded-2xl
            border
            border-border
            bg-surface
            p-10
            text-center
          "
        >

          <p
            className="
              text-sm
              text-muted-foreground
            "
          >
            Loading your profile...
          </p>

        </div>

      </div>

    );

  }


  /* ==========================================================
     ERROR
  ========================================================== */

  if (!profile) {

    return (

      <div
        className="
          mx-auto
          w-full
          max-w-5xl
          px-5
          py-10
          sm:px-8
        "
      >

        <div
          className="
            rounded-2xl
            border
            border-border
            bg-surface
            p-10
            text-center
          "
        >

          <p
            className="
              text-sm
              text-muted-foreground
            "
          >
            Unable to load your profile.
          </p>

        </div>

      </div>

    );

  }


  /* ==========================================================
     INITIALS
  ========================================================== */

  const initials =
    `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`
      .toUpperCase();


  /* ==========================================================
     PAGE
  ========================================================== */

  return (

    <div
      className="
        mx-auto
        w-full
        max-w-5xl
        px-5
        py-8
        text-foreground
        sm:px-8
      "
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <motion.header
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="
          flex
          items-center
          justify-between
          gap-4
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              grid
              h-11
              w-11
              place-items-center
              rounded-xl
              bg-primary/10
              text-primary
            "
          >

            <User className="h-5 w-5" />

          </div>


          <div>

            <h1
              className="
                text-2xl
                font-semibold
                tracking-tight
                text-foreground
              "
            >
              Profile
            </h1>


            <p
              className="
                mt-1
                text-sm
                text-muted-foreground
              "
            >
              Manage your personal information
              and career preferences.
            </p>

          </div>

        </div>


        {/* ==================================================
            EDIT / SAVE
        ================================================== */}

        {!isEditing ? (

          <button
            type="button"
            onClick={startEditing}
            className="
              inline-flex
              h-10
              items-center
              gap-2
              rounded-xl
              bg-primary
              px-4
              text-[13px]
              font-medium
              text-primary-foreground
              shadow-soft
              transition-all
              hover:scale-[1.02]
              hover:opacity-90
            "
          >

            <Pencil className="h-4 w-4" />

            Edit

          </button>

        ) : (

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="
                inline-flex
                h-10
                items-center
                rounded-xl
                border
                border-border
                bg-background
                px-4
                text-[13px]
                font-medium
                text-muted-foreground
                transition-colors
                hover:bg-accent
                hover:text-foreground
                disabled:opacity-50
              "
            >
              Cancel
            </button>


            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="
                inline-flex
                h-10
                items-center
                gap-2
                rounded-xl
                bg-primary
                px-4
                text-[13px]
                font-medium
                text-primary-foreground
                shadow-soft
                transition-all
                hover:scale-[1.02]
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              <Save className="h-4 w-4" />

              {saving
                ? "Saving..."
                : "Save changes"}

            </button>

          </div>

        )}

      </motion.header>


      {/* ======================================================
          PROFILE CARD
      ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.55,
          delay: 0.08,
        }}
        className="
          mt-8
          divide-y
          divide-border
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-surface
          shadow-soft
        "
      >

        {/* ====================================================
            PROFILE
        ==================================================== */}

        <Row
          title="Profile"
          description="Your ResumeLens account information."
          icon={
            <User className="h-4 w-4" />
          }
        >

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <div
              className="
                grid
                h-14
                w-14
                shrink-0
                place-items-center
                rounded-full
                bg-primary
                text-[15px]
                font-semibold
                text-primary-foreground
              "
            >
              {initials || "U"}
            </div>


            <div>

              <p
                className="
                  text-sm
                  font-medium
                  text-foreground
                "
              >
                {profile.first_name}{" "}
                {profile.last_name}
              </p>


              <p
                className="
                  mt-1
                  text-xs
                  text-muted-foreground
                "
              >
                Member since{" "}
                {profile.created_at || "—"}
              </p>

            </div>

          </div>

        </Row>


        {/* ====================================================
            NAME
        ==================================================== */}

        <Row
          title="Name"
          description="Shown on your ResumeLens profile and reports."
          icon={
            <User className="h-4 w-4" />
          }
        >

          <div
            className="
              grid
              gap-3
              sm:grid-cols-2
            "
          >

            <input
              value={
                profile.first_name
              }
              readOnly={!isEditing}
              onChange={(e) =>
                updateField(
                  "first_name",
                  e.target.value
                )
              }
              className={`
                ${profileInputClass}
                ${
                  !isEditing
                    ? "cursor-default"
                    : ""
                }
              `}
              aria-label="First name"
              placeholder="First name"
            />


            <input
              value={
                profile.last_name
              }
              readOnly={!isEditing}
              onChange={(e) =>
                updateField(
                  "last_name",
                  e.target.value
                )
              }
              className={`
                ${profileInputClass}
                ${
                  !isEditing
                    ? "cursor-default"
                    : ""
                }
              `}
              aria-label="Last name"
              placeholder="Last name"
            />

          </div>

        </Row>


        {/* ====================================================
            EMAIL
        ==================================================== */}

        <Row
          title="Email"
          description="Used for signing in to your account."
          icon={
            <Mail className="h-4 w-4" />
          }
        >

          <input
            value={
              profile.email
            }
            readOnly={!isEditing}
            onChange={(e) =>
              updateField(
                "email",
                e.target.value.toLowerCase()
              )
            }
            type="email"
            autoCapitalize="none"
            spellCheck={false}
            className={`
              ${profileInputClass}
              ${
                !isEditing
                  ? "cursor-default"
                  : ""
              }
            `}
            aria-label="Email"
            placeholder="you@gmail.com"
          />

        </Row>


        {/* ====================================================
            PHONE
        ==================================================== */}

        <Row
          title="Phone"
          description="Used for account recovery and contact information."
          icon={
            <Phone className="h-4 w-4" />
          }
        >

          <PhoneInput
            countryCode={
              countryCode
            }
            phone={
              profile.phone
            }
            disabled={
              !isEditing
            }
            onCountryCodeChange={
              setCountryCode
            }
            onPhoneChange={(value) =>
              updateField(
                "phone",
                value
              )
            }
          />

        </Row>


        {/* ====================================================
            CAREER STAGE
        ==================================================== */}

        <Row
          title="Career stage"
          description="Used to calibrate scoring and role recommendations."
          icon={
            <Briefcase className="h-4 w-4" />
          }
        >

          <div
            className="
              grid
              grid-cols-4
              gap-1.5
              rounded-xl
              border
              border-border
              bg-background
              p-1
              dark:border-slate-700
              dark:bg-slate-950
            "
          >

            {[
              {
                id: "student",
                label: "Student",
              },
              {
                id: "fresher",
                label: "Fresher",
              },
              {
                id: "experienced",
                label: "Experienced",
              },
              {
                id: "other",
                label: "Other",
              },
            ].map((item) => (

              <button
                key={
                  item.id
                }
                type="button"
                disabled={
                  !isEditing
                }
                onClick={() => {

                  updateField(
                    "role",
                    item.id
                  );


                  if (
                    item.id !==
                    "other"
                  ) {

                    updateField(
                      "other_role",
                      ""
                    );

                  }


                  if (
                    item.id !==
                      "experienced" &&
                    item.id !==
                      "other"
                  ) {

                    updateField(
                      "experience",
                      "0"
                    );

                  }

                }}
                className={`
                  h-9
                  rounded-lg
                  text-[12px]
                  font-medium
                  transition-colors
                  ${
                    profile.role ===
                    item.id
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground"
                  }
                  ${
                    isEditing
                      ? "hover:bg-accent hover:text-foreground"
                      : "cursor-default"
                  }
                `}
              >

                {item.label}

              </button>

            ))}

          </div>

        </Row>


        {/* ====================================================
            OTHER ROLE
        ==================================================== */}

        {profile.role ===
          "other" && (

          <Row
            title="Type of role"
            description="Tell us what type of role you are targeting."
            icon={
              <Briefcase className="h-4 w-4" />
            }
          >

            <input
              value={
                profile.other_role ||
                ""
              }
              readOnly={
                !isEditing
              }
              onChange={(e) =>
                updateField(
                  "other_role",
                  e.target.value
                )
              }
              type="text"
              placeholder="e.g. Designer, Researcher, Entrepreneur"
              className={`
                ${profileInputClass}
                ${
                  !isEditing
                    ? "cursor-default"
                    : ""
                }
              `}
              aria-label="Type of role"
            />

          </Row>

        )}


        {/* ====================================================
            EXPERIENCE
        ==================================================== */}

        {(profile.role ===
          "experienced" ||
          profile.role ===
            "other") && (

          <Row
            title="Experience"
            description={
              profile.role ===
              "experienced"
                ? "Years of relevant professional experience. Required."
                : "Years of experience. Optional for other roles."
            }
            icon={
              <Briefcase className="h-4 w-4" />
            }
          >

            <input
              value={
                profile.experience ||
                ""
              }
              readOnly={
                !isEditing
              }
              onChange={(e) =>
                updateField(
                  "experience",
                  e.target.value
                )
              }
              type="number"
              min={0}
              max={45}
              required={
                profile.role ===
                "experienced"
              }
              placeholder="e.g. 4"
              className={`
                ${profileInputClass}
                max-w-xs
                ${
                  !isEditing
                    ? "cursor-default"
                    : ""
                }
              `}
              aria-label="Years of experience"
            />


            {profile.role ===
              "other" && (

              <p
                className="
                  mt-1.5
                  text-[11.5px]
                  text-muted-foreground
                "
              >
                Optional
              </p>

            )}

          </Row>

        )}


        {/* ====================================================
            ACCOUNT
        ==================================================== */}

        <Row
          title="Account"
          description="Your ResumeLens account information."
          icon={
            <CalendarDays className="h-4 w-4" />
          }
        >

          <div
            className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-border
              bg-background
              p-4
              dark:border-slate-700
              dark:bg-slate-950
            "
          >

            <div
              className="
                grid
                size-10
                shrink-0
                place-items-center
                rounded-lg
                bg-primary/10
                text-primary
              "
            >

              <CalendarDays
                className="h-5 w-5"
              />

            </div>


            <div>

              <p
                className="
                  text-sm
                  font-medium
                  text-foreground
                "
              >
                Account created
              </p>


              <p
                className="
                  mt-1
                  text-xs
                  text-muted-foreground
                "
              >
                {profile.created_at ||
                  "—"}
              </p>

            </div>

          </div>

        </Row>

      </motion.div>


      {/* ======================================================
          STATUS
      ====================================================== */}

      <div
        className="
          mt-4
          text-right
        "
      >

        <p
          className="
            text-[11px]
            text-muted-foreground
          "
        >
          {isEditing
            ? "You are editing your profile."
            : "Your profile is read-only."}
        </p>

      </div>

    </div>
  );
}
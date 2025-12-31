
export const GoogleAuth = {
  init(clientId: string, callback: (response: any) => void) {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: callback,
      });
      google.accounts.id.renderButton(
        document.getElementById("google-signin-button")!,
        { theme: "outline", size: "large", type: "standard" }
      );
    };
    document.head.appendChild(script);
  },
};

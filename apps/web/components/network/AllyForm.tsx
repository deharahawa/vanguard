import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createAlly, updateAlly } from "@/actions/network";
import { AllyFormData } from "@/types/network";

type AllyFormProps = {
    initialData?: AllyFormData & { id: string };
    onClose: () => void;
};

export function AllyForm({ initialData, onClose }: AllyFormProps) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AllyFormData>({
        defaultValues: initialData || {
            name: "",
            role: "Network",
            frequencyDays: 7,
            contactMethod: ""
        }
    });

    const onSubmit = async (data: AllyFormData) => {
        try {
            if (initialData) {
                const result = await updateAlly(initialData.id, data);
                if (result.error) throw new Error(result.error);
                toast.success("Ally updated successfully");
            } else {
                const result = await createAlly(data);
                if (result.error) throw new Error(result.error);
                toast.success("Ally recruited successfully");
            }
            onClose();
        } catch (error) {
            toast.error("Operation failed");
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-500">Codename / Name</label>
                <input 
                    {...register("name", { required: "Name is required" })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="e.g. Agent Smith"
                />
                {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
            </div>

            <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-500">Role / Circle</label>
                <select 
                    {...register("role", { required: "Role is required" })}
                     className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                    <option value="Inner Circle">Inner Circle</option>
                    <option value="Network">Network</option>
                    <option value="Family">Family</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Asset">Asset</option>
                </select>
            </div>

             <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-500">Contact Frequency (Days)</label>
                <input 
                    type="number"
                    {...register("frequencyDays", { required: "Frequency is required", min: 1 })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                 <p className="text-[10px] text-zinc-600">Ideal gap between checkpoints.</p>
            </div>

            <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-500">Comms Link (Optional)</label>
                <input 
                    {...register("contactMethod")}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="https://wa.me/..."
                />
                 <p className="text-[10px] text-zinc-600">Direct URL to WhatsApp, Telegram, or Phone.</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="px-4 py-2 text-zinc-500 hover:text-white text-xs uppercase font-bold transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs uppercase font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? "Processing..." : (initialData ? "Update Data" : "Recruit Ally")}
                </button>
            </div>
        </form>
    );
}

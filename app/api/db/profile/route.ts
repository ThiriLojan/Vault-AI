import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'demo';

    const isDemo = userId === 'demo' || userId === 'demo@vaultai.io' || userId === 'guest' || userId === 'guest_demo';

    if (isDemo) {
        return NextResponse.json({
            success: true,
            profile: {
                username: "Vault AI Demo",
                email: "demo@vaultai.io",
                bio: "Demo Showcase Account • Live Preview",
                ringColor: "#00d4aa",
                profilePhoto: "",
                aiMode: "Balanced Growth Strategy"
            }
        });
    }

    try {
        await connectToDatabase();

        // Restore Thiri Lojan's real account name in DB
        if (userId === 'Thiri Lojan' || userId === 'thirilojan.hl@gmail.com' || userId === 'Vault AI Showcase') {
            await UserModel.findOneAndUpdate(
                { $or: [{ email: 'thirilojan.hl@gmail.com' }, { username: 'Vault AI Showcase' }, { username: 'Thiri Lojan' }] },
                { $set: { username: 'Thiri Lojan' } }
            );
        }

        const user: any = await UserModel.findOne({
            $or: [{ username: userId }, { email: userId }]
        });
        if (user) {
            return NextResponse.json({
                success: true,
                profile: {
                    username: user.username,
                    email: user.email,
                    bio: user.bio || 'Neural Quantitative Investor',
                    ringColor: user.ringColor || '#00d4aa',
                    profilePhoto: user.profilePhoto || '',
                    aiMode: user.aiMode || 'Balanced Portfolio Engine'
                }
            });
        }
    } catch (err) {
        console.log("MongoDB Profile GET fallback active");
    }

    return NextResponse.json({ success: false, profile: null });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, displayName, bio, ringColor, riskPreference, profilePhoto } = body;

        if (!userId) {
            return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });
        }

        const isDemo = userId === 'demo' || userId === 'demo@vaultai.io' || userId === 'guest' || userId === 'guest_demo';
        if (isDemo) {
            return NextResponse.json({ success: true, mocked: true });
        }

        try {
            await connectToDatabase();
            const updatedUser = await UserModel.findOneAndUpdate(
                { $or: [{ username: userId }, { email: userId }] },
                {
                    $set: {
                        ...(displayName && { username: displayName }),
                        ...(bio && { bio }),
                        ...(ringColor && { ringColor }),
                        ...(riskPreference && { aiMode: riskPreference }),
                        ...(profilePhoto !== undefined && { profilePhoto })
                    }
                },
                { new: true }
            );

            if (updatedUser) {
                return NextResponse.json({ success: true, profile: updatedUser });
            }
        } catch (dbErr) {
            console.log("MongoDB Profile POST fallback active");
        }

        return NextResponse.json({ success: true, fallback: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
